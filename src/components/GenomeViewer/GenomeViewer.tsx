import * as d3 from 'd3';

import {
    Sequence,
    Transcriptome,
    D3Grid,
    GridConfig,
} from 'sparrowgenomelib';

import { SequencePlot } from './SequencePlot';
import { TranscriptomePlot } from './TranscriptomePlot';

interface GenomeViewerData {
    transcriptome: Transcriptome;
    sequence: Sequence;
    positionRange: [number, number];
    width: number;
    height: number;
    fontSize: number;
}

export class GenomeViewer {
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private width: number;
    private height: number;
    private fontSize: number;
    private transcriptome: Transcriptome = new Transcriptome();
    private sequence: Sequence = new Sequence();
    private positionRange: [number, number] = [0, 0];

    private gridConfig: GridConfig = {
        columns: 1,
        columnRatios: [1.0], // plot, labels, legend
        rowRatiosPerColumn: [
            [0.09, 0.91], // sequence
            [0.09, 0.91], // transcriptome
        ],
    };
    private grid: D3Grid;

    constructor(
        svgElement: d3.Selection<SVGSVGElement, unknown, null, undefined>,
        data: GenomeViewerData
    ) {
        this.width = data.width;
        this.height = data.height;
        this.fontSize = data.fontSize;

        this.transcriptome = data.transcriptome;
        this.sequence = data.sequence;
        this.positionRange = data.positionRange;

        this.svg = svgElement;

        this.grid = new D3Grid(this.svg, this.height, this.width, this.gridConfig);
    }

    public plot(): void {
        const sequencePlotSvg = this.grid.getCellSvg(0, 0);
        if (sequencePlotSvg) {
            const dimensions = this.grid.getCellDimensions(0, 0);
            const coordinates = this.grid.getCellCoordinates(0, 0);

            const SequencePlotDimensions = {
                width: dimensions?.width || 0,
                height: dimensions?.height || 0,
                x: coordinates?.x || 0,
                y: coordinates?.y || 0,
                fontSize: this.fontSize,
            };

            // Check if the position range exceeds 100
            if (this.positionRange[1] - this.positionRange[0] > 100) {
                // Replace SequencePlot with a simple line
                sequencePlotSvg
                    .append('line')
                    .attr('x1', SequencePlotDimensions.x)
                    .attr('y1', SequencePlotDimensions.y + SequencePlotDimensions.height / 2)
                    .attr('x2', SequencePlotDimensions.x + SequencePlotDimensions.width)
                    .attr('y2', SequencePlotDimensions.y + SequencePlotDimensions.height / 2)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 2);
            } else {
                const sequencePlot = new SequencePlot(sequencePlotSvg, {
                    dimensions: SequencePlotDimensions,
                    sequence: this.sequence,
                    seqId: this.transcriptome.getSeqId(),
                    positionRange: this.positionRange,
                });
                this.grid.setCellData(0, 0, sequencePlot);
                sequencePlot.plot();
            }
        }

        const transcriptomePlotSvg = this.grid.getCellSvg(0, 1);
        let gene_coords: any[] = [];
        if (transcriptomePlotSvg) {
            const dimensions = this.grid.getCellDimensions(0, 1);
            const coordinates = this.grid.getCellCoordinates(0, 1);

            const transcriptomePlotDimensions = {
                width: dimensions?.width || 0,
                height: dimensions?.height || 0,
                x: coordinates?.x || 0,
                y: coordinates?.y || 0,
                fontSize: this.fontSize,
            };

            const transcriptomePlot = new TranscriptomePlot(transcriptomePlotSvg, {
                dimensions: transcriptomePlotDimensions,
                transcriptome: this.transcriptome,
                positionRange: this.positionRange,
            });
            this.grid.setCellData(0, 1, transcriptomePlot);
            gene_coords = transcriptomePlot.plot();
        }
    }
}