"use client"

import Header from "./header";
import ImageClassification from "./image-classification";
import { useState } from "react";

export default function HomeWrapper() {
    const [ darkTheme, setDarkTheme ] = useState(false);

    const toggleTheme = () => {
        setDarkTheme(!darkTheme)
        document.body.classList.toggle('dark');
    }
    
    return (
        <div className="w-full">
            <Header toggleTheme={toggleTheme} darkTheme={darkTheme} />
            <ImageClassification />
        </div>
    )
}
