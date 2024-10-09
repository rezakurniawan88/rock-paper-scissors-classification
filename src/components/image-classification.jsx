"use client"

import * as tf from "@tensorflow/tfjs"
import { useEffect, useState } from "react";

export default function ImageClassification() {
    const [model, setModel] = useState(null);
    const [image, setImage] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loadingModel, setLoadingModel] = useState(false);
    const [loadingPredict, setLoadingPredict] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const loadModel = async () => {
                try {
                    setLoadingModel(true);
                    console.log("Starting to load model...");
                    const model = await tf.loadLayersModel("/tfjs_rpsmodel/model.json");
                    setModel(model);
                    console.log("Load model success ...");
                    setLoadingModel(false);
                } catch (error) {
                    console.log("Failed to load model ...");
                    setLoadingModel(false);
                }
            };
            loadModel();
        }
    }, []);

    const handleImageUpload = (event) => {
        try {
            const file = event.target.files[0];
            setImage(file);
        } catch (error) {
            console.log(error);
        }
    }

    const handlePredict = async () => {
        setLoadingPredict(true);
        if (!image || !model) {
            console.log("Image or model is not ready");
            alert("Image or model is not ready");
            setLoadingPredict(false);
            return;
        }

        try {
            const img = new Image();
            img.src = URL.createObjectURL(image);
            img.onload = async () => {
                console.log("Image loaded");
                const canvas = document.createElement('canvas');
                canvas.width = 150;
                canvas.height = 150;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, 150, 150);
                const imageTensor = tf.browser.fromPixels(canvas)
                    .toFloat()
                    .div(tf.scalar(255))
                    .expandDims();
                const result = await model.predict(imageTensor);
                const predictionValue = result.dataSync();

                const values = Object.values(predictionValue);
                const classes = values.indexOf(Math.max(...values));
                const probability = Math.max(...values);

                let prediction;
                if (classes === 0) {
                    prediction = "Paper";
                } else if (classes === 1) {
                    prediction = "Rock";
                } else {
                    prediction = "Scissors";
                }

                const predictionResult = {
                    classes: prediction,
                    probability,
                };

                setPrediction(predictionResult);
                setLoadingPredict(false);
            };
        } catch (error) {
            console.log("Prediction failed ...");
            setPrediction(null);
            setLoadingPredict(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full dark:text-white">
            <h1 className="text-2xl font-semibold mb-6">Rock-Paper-Scissors Classification</h1>
            {loadingModel ? (
                <div>Loading model...</div>
            ) : null}
            <div className="space-y-8 w-[25rem]">
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="upload-image" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                    {image ? (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 overflow-hidden">
                            <img width={300} height={300} src={URL.createObjectURL(image)} alt="Uploaded Image" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                        </div>
                    )}
                        <canvas id="canvasId" width="224" height="224" className="hidden"></canvas>
                        <input type="file" onChange={handleImageUpload} id="upload-image" className="hidden" />
                    </label>
                </div>

                <button onClick={handlePredict} className="bg-blue-600 w-full py-3 px-6 text-sm font-bold text-white rounded-full hover:bg-blue-500">{loadingPredict ? "Loading ..." : "Predict Now"}</button>
                <div>
                    {prediction ? (
                        <div>
                            <p>This is a <span className="font-semibold">{prediction?.classes} Image</span></p>
                            <p>Probability: <span className="font-semibold">{Math.round(prediction?.probability * 100).toFixed(2)} %</span></p>
                        </div>
                    ) : (
                        <h1>Upload an image and click &quot;Predict Now&quot; to see the result</h1>
                    )}
                </div>
            </div>
        </div>
    )
}
