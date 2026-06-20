import { useState, useRef, useCallback } from "react";

// Web Speech API (Google STT) kullanarak ses tanıma
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceSearch({ onResult, onError }) {
    const [listening, setListening] = useState(false);
    const [supported, setSupported] = useState(!!SpeechRecognition);
    const recognitionRef = useRef(null);

    const startListening = useCallback(() => {
        if (!SpeechRecognition) {
            onError?.("Tarayıcınız ses tanımayı desteklemiyor. Lütfen Chrome kullanın.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "tr-TR";
        recognition.interimResults = false;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setListening(false);
            onResult?.(transcript);
        };

        recognition.onerror = (event) => {
            setListening(false);
            if (event.error === "not-allowed") {
                onError?.("Mikrofon izni reddedildi. Lütfen tarayıcı ayarlarından mikrofon erişimine izin verin.");
            } else if (event.error === "no-speech") {
                onError?.("Ses algılanamadı. Tekrar deneyin.");
            } else if (event.error !== "aborted") {
                onError?.(`Ses tanıma hatası: ${event.error}`);
            }
        };

        recognition.onend = () => {
            setListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [onResult, onError]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }
        setListening(false);
    }, []);

    if (!supported) return null;

    return (
        <button
            type="button"
            onClick={listening ? stopListening : startListening}
            className={`absolute right-12 top-1/2 -translate-y-1/2 transition-all cursor-pointer ${
                listening
                    ? "text-red-500 animate-pulse"
                    : "text-outline hover:text-primary"
            }`}
            title={listening ? "Dinleniyor... (durdurmak için tıkla)" : "Sesli arama (Google STT)"}
        >
            <span className="material-symbols-outlined">
                {listening ? "mic_off" : "mic"}
            </span>
            {listening && (
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-red-500 whitespace-nowrap font-caption">
                    Dinleniyor...
                </span>
            )}
        </button>
    );
}
