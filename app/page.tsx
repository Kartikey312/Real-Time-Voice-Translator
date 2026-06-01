"use client";

import { useRef, useState } from "react";

export default function Home() {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState("Ready");

  const startRecording = async () => {
    try {
      chunksRef.current = [];

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);

      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.start();

      setStatus("🎤 Recording...");
    } catch (error) {
      console.error("Mic Error:", error);
      setStatus("❌ Microphone permission denied");
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current) {
      setStatus("❌ No recording in progress");
      return;
    }

    recorderRef.current.onstop = async () => {
      try {
        setStatus("⏳ Uploading...");

        const blob = new Blob(
          chunksRef.current,
          {
            type: "audio/webm",
          }
        );

        const formData = new FormData();

        formData.append(
          "audio",
          blob,
          "voice.webm"
        );

        const response = await fetch(
          "http://127.0.0.1:5000/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const data = await response.json();

        console.log(data);

        setStatus("✅ Upload Successful");

        streamRef.current
          ?.getTracks()
          .forEach((track) => track.stop());
      } catch (error) {
        console.error(
          "Upload Error:",
          error
        );
        setStatus("❌ Upload Failed");
      }
    };

    recorderRef.current.stop();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black">
      <h1 className="text-3xl font-bold text-white">
        Real-Time Voice Translator
      </h1>

      <div className="flex gap-4">
        <button
          onClick={startRecording}
          className="rounded-lg bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700"
        >
          Start Recording
        </button>

        <button
          onClick={stopRecording}
          className="rounded-lg bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700"
        >
          Stop Recording
        </button>
      </div>

      <p className="text-lg text-white">
        {status}
      </p>
    </main>
  );
}