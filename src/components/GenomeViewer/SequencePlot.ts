import * as d3 from "d3";
import { Sequence, Dimensions } from 'sparrowgenomelib'; // Import your Sequence class

interface SequencePlotData {
  dimensions: Dimensions;
  sequence: Sequence;
  seqId: string;
  positionRange?: [number, number]; // Optional range of positions to display [start, end]
}

export class SequencePlot {
  private svg: d3.Selection<any, unknown, null, undefined>;
  private dimensions: Dimensions;
  private sequence: Sequence;
  private positionRange: [number, number] | null = null;
  private seqId: string | null = null;
  private nucleotideColors = {
    'A': '#A0D6B9', // Adenine - green
    'T': '#F5A286', // Thymine - red
    'G': '#F8D90C', // Guanine - yellow
    'C': '#317BC5', // Cytosine - blue
    'U': '#F5A286', // Uracil (RNA) - same as Thymine
    'N': '#CCCCCC'  // Unknown - gray
  };
  
  constructor(
    svg: d3.Selection<any, unknown, null, undefined>,
    data: SequencePlotData
  ) {
    this.svg = svg;
    this.dimensions = data.dimensions;
    this.sequence = data.sequence;
    
    // Set position range if provided
    if (data.positionRange) {
      this.positionRange = data.positionRange;
    }
    
    // Set sequence ID if provided, otherwise use primary
    this.seqId = data.seqId;
  }

  public plot(): void {
    if (!this.seqId || this.sequence.getSequenceIds().length === 0) {
        console.error("No sequence ID provided or no sequences available.");
        return;
    }

    // Get sequence length and determine start/end positions
    const seqLength = this.sequence.getLength(this.seqId);
    const start = this.positionRange ? Math.max(1, this.positionRange[0]) : 1;
    const end = this.positionRange ? Math.min(seqLength, this.positionRange[1]) : seqLength;
    
    // Get the subsequence to display
    const subsequence = this.sequence.getSubsequence(start, end, this.seqId);
    
    // Calculate the width of each nucleotide
    const nucleotideWidth = this.dimensions.width / subsequence.length;
    const nucleotideHeight = this.dimensions.height - 20; // Leave space for axis labels and ticks

    // Add a background rectangle
    this.svg.append("rect")
      .attr("class", "sequence-background")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", this.dimensions.width)
      .attr("height", this.dimensions.height)
      .attr("fill", "#f7f7f7")
      .attr("fill-opacity", 0.75);
    
    // Create nucleotide data array
    const nucleotides: {position: number, base: string}[] = [];
    for (let i = 0; i < subsequence.length; i++) {
      nucleotides.push({
        position: start + i,
        base: subsequence[i]
      });
    }
    
    // Create group for nucleotides
    const nucleotideGroup = this.svg.append("g")
      .attr("class", "nucleotide-group");
    
    // Add nucleotide rectangles and labels
    nucleotideGroup.selectAll(".nucleotide")
      .data(nucleotides)
      .enter()
      .append("g")
      .attr("class", "nucleotide")
      .attr("transform", (d, i) => `translate(${i * nucleotideWidth}, 0)`)
      .each((d, i, nodes) => {
        const g = d3.select(nodes[i]);
        
        // Add nucleotide rectangle
        g.append("rect")
          .attr("width", nucleotideWidth)
          .attr("height", nucleotideHeight)
          .attr("fill", this.nucleotideColors[d.base] || this.nucleotideColors['N']);
        
        // Add nucleotide text
        g.append("text")
          .attr("x", nucleotideWidth / 2)
          .attr("y", nucleotideHeight / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .attr("font-family", "monospace")
          .attr("font-weight", "bold")
          .attr("fill", "#333")
          .text(d.base);
      });
    
    // Create a scale that positions ticks at the center of each nucleotide block
    const xScale = d3.scaleLinear()
      .domain([start, end])
      .range([nucleotideWidth / 2, this.dimensions.width - nucleotideWidth / 2]);

    // Determine appropriate number of ticks based on available space
    const maxTicks = Math.min(10, subsequence.length);
    
    // Create tick values that correspond to nucleotide positions
    const tickStep = Math.ceil(subsequence.length / maxTicks);
    const tickValues = Array.from({length: Math.ceil(subsequence.length / tickStep)}, 
      (_, i) => start + i * tickStep);
    
    // Add x-axis with position labels at the center of nucleotide blocks
    const xAxis = d3.axisBottom(xScale)
      .tickValues(tickValues)
      .tickFormat(d => d.toString());

    this.svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${nucleotideHeight})`)
      .call(xAxis);
  }
}