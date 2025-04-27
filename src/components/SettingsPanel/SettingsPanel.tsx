import React, { useState, useEffect } from "react";
import { Card, Form, OverlayTrigger, Tooltip, Row, Col, Button } from "react-bootstrap";
import { InfoCircle } from "react-bootstrap-icons";
import "./SettingsPanel.css";

interface SettingsPanelProps {
    gtfStatus: number;
    onGTFUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    fastaStatus: number;
    onFastaUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    positionRange: [number, number];
    onPositionRangeChange: (range: [number, number]) => void;
    fontSize: number;
    onFontSizeChange: (value: number) => void;
    width: number;
    onWidthChange: (value: number) => void;
    height: number;
    onHeightChange: (value: number) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
    gtfStatus,
    onGTFUpload,
    fastaStatus,
    onFastaUpload,
    positionRange,
    onPositionRangeChange,
    fontSize,
    onFontSizeChange,
    width,
    onWidthChange,
    height,
    onHeightChange,
}) => {
    const [startPosition, setStartPosition] = useState<number>(positionRange[0]);
    const [endPosition, setEndPosition] = useState<number>(positionRange[1]);

    useEffect(() => {
        setStartPosition(positionRange[0]);
        setEndPosition(positionRange[1]);
    }, [positionRange]);

    const getMaxPosition = () => {
        return positionRange[1] > 0 ? positionRange[1] : 1000;
    };

    const handleStartPositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setStartPosition(value);
    };

    const handleEndPositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setEndPosition(value);
    };

    const handleConfirmRangeChange = () => {
        onPositionRangeChange([startPosition, endPosition]);
    };

    const tooltips = {
        gtf: (
            <Tooltip id="gtf-tooltip" className="tooltip-hover">
                <strong>GTF File Format Example:</strong>
                <pre style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    {'chr1\tVIRUS\texon\t1000\t1200\t.\t+\t.\tgene_id "gene1"; transcript_id "transcript1";\n' +
                        'chr1\tVIRUS\tCDS\t1050\t1150\t.\t+\t0\tgene_id "gene1"; transcript_id "transcript1";'}
                </pre>
                <div>GTF files contain gene annotations with 9 tab-separated columns.</div>
            </Tooltip>
        ),
        fasta: (
            <Tooltip id="fasta-tooltip" className="tooltip-hover">
                <strong>FASTA File Format Example:</strong>
                <pre style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    {'>chr1\n' +
                        'GATTACAATTCGAGTACGATCGATCGATCGATCGATCGATCGATCG\n'}
                </pre>
                <div>Fasta file with sequences corresponding to the annotation.</div>
            </Tooltip>
        ),
        range: (
            <Tooltip id="range-tooltip" className="tooltip-hover">
                <strong>Position Range:</strong>
                <div>Set the genomic coordinates to view. Use sliders or input exact values.</div>
            </Tooltip>
        )
    };

    return (
        <div className="settings-panel">
            <Card className="settings-card">
                <Card.Body className="settings-body">
                    <Card.Title className="settings-title">Settings</Card.Title>
                    <Form>
                        {/* GTF Upload */}
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Pathogen GTF
                                <OverlayTrigger placement="right" overlay={tooltips.gtf}>
                                    <span className="ms-2" style={{ cursor: 'help' }}>
                                        <InfoCircle size={16} />
                                    </span>
                                </OverlayTrigger>
                            </Form.Label>
                            <Form.Control type="file" onChange={onGTFUpload} />
                            {gtfStatus === -1 && (
                                <div className="text-danger">Error parsing GTF file</div>
                            )}
                        </Form.Group>

                        {/* FASTA Upload */}
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Pathogen FASTA
                                <OverlayTrigger placement="right" overlay={tooltips.fasta}>
                                    <span className="ms-2" style={{ cursor: 'help' }}>
                                        <InfoCircle size={16} />
                                    </span>
                                </OverlayTrigger>
                            </Form.Label>
                            <Form.Control type="file" onChange={onFastaUpload} />
                            {fastaStatus === -1 && (
                                <div className="text-danger">Error parsing FASTA file</div>
                            )}
                        </Form.Group>

                        {/* Position Range Controls */}
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex align-items-center">
                                Position Range
                                <OverlayTrigger placement="right" overlay={tooltips.range}>
                                    <span className="ms-2" style={{ cursor: 'help' }}>
                                        <InfoCircle size={16} />
                                    </span>
                                </OverlayTrigger>
                            </Form.Label>
                            <Row className="mb-2">
                                <Col>
                                    <Form.Label className="small">Start Position</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={0}
                                        max={endPosition - 1}
                                        value={startPosition}
                                        onChange={handleStartPositionChange}
                                    />
                                </Col>
                                <Col>
                                    <Form.Label className="small">End Position</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={startPosition + 1}
                                        max={getMaxPosition()}
                                        value={endPosition}
                                        onChange={handleEndPositionChange}
                                    />
                                </Col>
                            </Row>
                            <Button variant="primary" onClick={handleConfirmRangeChange}>
                                Confirm Range
                            </Button>
                        </Form.Group>

                        {/* Font Size */}
                        <Form.Group className="mb-3">
                            <Form.Label>Font Size</Form.Label>
                            <Form.Control
                                type="number"
                                value={fontSize}
                                onChange={(e) => onFontSizeChange(Number(e.target.value))}
                            />
                        </Form.Group>

                        {/* Width */}
                        <Form.Group className="mb-3">
                            <Form.Label>Width</Form.Label>
                            <Form.Control
                                type="number"
                                value={width}
                                onChange={(e) => onWidthChange(Number(e.target.value))}
                            />
                        </Form.Group>

                        {/* Height */}
                        <Form.Group className="mb-3">
                            <Form.Label>Height</Form.Label>
                            <Form.Control
                                type="number"
                                value={height}
                                onChange={(e) => onHeightChange(Number(e.target.value))}
                            />
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default SettingsPanel;