import React, { useState } from "react";
import "./Home.css";
import SettingsPanel from "../SettingsPanel/SettingsPanel";
import ErrorModal from "../ErrorModal/ErrorModal";
import GenomeViewerWrapper from "../GenomeViewer/GenomeViewerWrapper";

import { Transcriptome, Sequence } from 'sparrowgenomelib';

const Home: React.FC = () => {
    const [transcriptome, setTranscriptome] = useState<Transcriptome>(new Transcriptome());
    const [sequence, setSequence] = useState<Sequence>(new Sequence());
    const [positionRange, setPositionRange] = useState<[number, number]>([0, 0]);
    const [fontSize, setFontSize] = useState<number>(10);
    const [width, setWidth] = useState<number>(1100);
    const [height, setHeight] = useState<number>(700);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleGtfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const txdata = await Transcriptome.create(file);
                setTranscriptome(txdata);
            } catch (error) {
                setTranscriptome(new Transcriptome());
                setErrorMessage("Unable to parse the file. Please make sure the file is in GTF format. Try to run gffread -T to prepare your file.");
                setErrorModalVisible(true);
            }
        }
    };

    const handleFastaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const seqdata = await Sequence.create(file);
                setSequence(seqdata);
                setPositionRange([0, seqdata.getLength()]);
            } catch (error) {
                setSequence(new Sequence());
                setErrorMessage("Unable to parse the file. Please make sure the file is in FASTA format.");
                setErrorModalVisible(true);
            }
        }
    };

    const closeErrorModal = () => {
        setErrorModalVisible(false);
    };

    return (
        <div className="splicemap-plot">
            <SettingsPanel
                gtfStatus={1}
                onGTFUpload={handleGtfUpload}
                fastaStatus={1}
                onFastaUpload={handleFastaUpload}
                positionRange={positionRange}
                onPositionRangeChange={setPositionRange}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                width={width}
                onWidthChange={setWidth}
                height={height}
                onHeightChange={setHeight}
            />

            <div className="visualization-container">
                <GenomeViewerWrapper
                    transcriptome={transcriptome}
                    sequence={sequence}
                    positionRange={positionRange}
                    width={width}
                    height={height}
                    fontSize={fontSize}
                />
            </div>

            <ErrorModal
                visible={errorModalVisible}
                message={errorMessage}
                onClose={closeErrorModal}
            />
        </div>
    );
};

export default Home;