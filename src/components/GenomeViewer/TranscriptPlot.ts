import { Dimensions, Transcript } from 'sparrowgenomelib';

// displays a single transcript

interface TranscriptPlotData {
    dimensions: Dimensions;
    transcript: Transcript;
    genome_length: number;
    positionRange?: [number, number]; // Optional position range to limit display
}

export class TranscriptPlot {
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private dimensions: Dimensions;
    private genome_length: number;
    private transcript: Transcript;
    private positionRange?: [number, number]; // Store the position range
    private exon_svgs: any;
    private cds_svgs: any;
    private intron_svgs: any;
    private minPosition: number = 0;
    private maxPosition: number = 0;

    constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
        data: TranscriptPlotData) {
        this.svg = svg;
        this.dimensions = data.dimensions;
        this.genome_length = data.genome_length;
        this.transcript = data.transcript;
        this.positionRange = data.positionRange;
        
        // Set the minimum and maximum positions for coordinate transformation
        this.minPosition = this.positionRange ? this.positionRange[0] : 0;
        this.maxPosition = this.positionRange ? this.positionRange[1] : this.genome_length;
        
        this.exon_svgs = [];
        this.cds_svgs = [];
        this.intron_svgs = [];
    }

    // Helper method to transform genomic coordinates to display coordinates
    private transformCoordinate(position: number): number {
        // Adjust position by the minimum position and calculate relative to the total length
        return ((position - this.minPosition) / this.genome_length) * this.dimensions["width"];
    }

    // Helper to check if a feature is within the viewable range
    private isWithinRange(start: number, end: number): boolean {
        if (!this.positionRange) return true; // No range restriction
        
        // Check if the feature overlaps with the position range
        return !(end < this.positionRange[0] || start > this.positionRange[1]);
    }

    // Helper to check if a position is outside the viewable range
    private isOutsideRange(position: number, direction: 'before' | 'after'): boolean {
        if (!this.positionRange) return false;
        
        if (direction === 'before') {
            return position < this.positionRange[0];
        } else { // 'after'
            return position > this.positionRange[1];
        }
    }

    // Helper to clip coordinates to the viewable range
    private clipToRange(position: number): number {
        if (!this.positionRange) return position;
        
        return Math.max(this.positionRange[0], Math.min(position, this.positionRange[1]));
    }

    public plot(): void {
        const exons = this.transcript.getExons();
        
        // Create arrays to track visible exons and their display coordinates
        const visibleExons = [];
        const visibleExonCoords = [];

        // Determine the transcript's start and end positions
        const transcriptStart = Math.min(...exons.map(exon => exon.getStart()));
        const transcriptEnd = Math.max(...exons.map(exon => exon.getEnd()));
        
        // First pass: identify visible exons and their display coordinates
        for (let i = 0; i < exons.length; i++) {
            const exon = exons[i];
            
            // Check if the exon is within the viewable range
            if (this.isWithinRange(exon.getStart(), exon.getEnd())) {
                // Clip exon coordinates to the viewable range
                const clippedStart = this.clipToRange(exon.getStart());
                const clippedEnd = this.clipToRange(exon.getEnd());
                
                // Transform to display coordinates
                const exon_start = this.transformCoordinate(clippedStart);
                const exon_end = this.transformCoordinate(clippedEnd);
                
                visibleExons.push(exon);
                visibleExonCoords.push({
                    index: i,
                    start: exon_start,
                    end: exon_end,
                    origStart: exon.getStart(),
                    origEnd: exon.getEnd()
                });
            }
        }
        
        // Draw exons
        for (let i = 0; i < visibleExons.length; i++) {
            const coord = visibleExonCoords[i];
            
            const exonSvg = this.svg
                .append('rect')
                .attr('x', coord.start)
                .attr('y', this.dimensions["height"] * ((1 - 0.5) / 2))
                .attr('width', Math.max(1, coord.end - coord.start)) // Ensure minimum width of 1 pixel
                .attr('height', this.dimensions["height"] * 0.5)
                .style('fill', '#4A88CA');
            this.exon_svgs.push(exonSvg);
        }
        
        // Check if there are exons before the view range
        const hasExonsBefore = exons.some(exon => exon.getEnd() < this.minPosition);
        
        // Check if there are exons after the view range
        const hasExonsAfter = exons.some(exon => exon.getStart() > this.maxPosition);
        
        // Draw introns between visible exons
        for (let i = 0; i < visibleExonCoords.length; i++) {
            // Draw intron before first visible exon if there are exons outside view range
            if (i === 0 && hasExonsBefore) {
                const rangeStart = this.transformCoordinate(this.minPosition);
                
                const intronBeforeSvg = this.svg.append('line')
                    .attr('x1', rangeStart)
                    .attr('y1', this.dimensions["height"] / 2)
                    .attr('x2', visibleExonCoords[i].start)
                    .attr('y2', this.dimensions["height"] / 2)
                    .style('stroke', '#280274')
                    .style('stroke-width', 1);
                this.intron_svgs.push(intronBeforeSvg);
            }
            
            // Draw intron between this exon and the next exon
            if (i < visibleExonCoords.length - 1) {
                const intronSvg = this.svg.append('line')
                    .attr('x1', visibleExonCoords[i].end)
                    .attr('y1', this.dimensions["height"] / 2)
                    .attr('x2', visibleExonCoords[i + 1].start)
                    .attr('y2', this.dimensions["height"] / 2)
                    .style('stroke', '#280274')
                    .style('stroke-width', 1);
                this.intron_svgs.push(intronSvg);
            }
            
            // Draw intron after last visible exon ONLY if there are exons outside the view range
            if (i === visibleExonCoords.length - 1 && hasExonsAfter) {
                const rangeEnd = this.transformCoordinate(this.maxPosition);
                
                const intronAfterSvg = this.svg.append('line')
                    .attr('x1', visibleExonCoords[i].end)
                    .attr('y1', this.dimensions["height"] / 2)
                    .attr('x2', rangeEnd)
                    .attr('y2', this.dimensions["height"] / 2)
                    .style('stroke', '#280274')
                    .style('stroke-width', 1);
                this.intron_svgs.push(intronAfterSvg);
            }
        }
        
        // Handle the case where there are no visible exons but the transcript overlaps the range
        if (visibleExonCoords.length === 0) {
            // Check if the transcript spans across the viewable area
            if (this.isWithinRange(transcriptStart, transcriptEnd)) {
                // Draw a line across the entire visible range 
                const rangeStart = this.transformCoordinate(this.minPosition);
                const rangeEnd = this.transformCoordinate(this.maxPosition);
                
                const spanLineSvg = this.svg.append('line')
                    .attr('x1', rangeStart)
                    .attr('y1', this.dimensions["height"] / 2)
                    .attr('x2', rangeEnd)
                    .attr('y2', this.dimensions["height"] / 2)
                    .style('stroke', '#280274')
                    .style('stroke-width', 1);
                this.intron_svgs.push(spanLineSvg);
            }
        }

        // Plot CDS
        const CDSs = this.transcript.getCDS();
        for (const cds of CDSs) {
            // Check if the CDS is within the viewable range
            if (!this.isWithinRange(cds.getStart(), cds.getEnd())) {
                continue; // Skip CDS outside the view range
            }
            
            // Clip CDS coordinates to the viewable range
            const clippedStart = this.clipToRange(cds.getStart());
            const clippedEnd = this.clipToRange(cds.getEnd());
            
            // Transform to display coordinates
            const cds_start = this.transformCoordinate(clippedStart);
            const cds_end = this.transformCoordinate(clippedEnd);
            
            const cdsSvg = this.svg
                .append('rect')
                .attr('x', cds_start)
                .attr('y', this.dimensions["height"] * ((1 - 0.75) / 2))
                .attr('width', Math.max(1, cds_end - cds_start)) // Ensure minimum width of 1 pixel
                .attr('height', this.dimensions["height"] * 0.75)
                .style('fill', '#F2C14E');
            this.cds_svgs.push(cdsSvg);
        }
    }
}