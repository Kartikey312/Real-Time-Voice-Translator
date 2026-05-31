"use client";

import { useRef } from "react";

export default function Home() {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.start();
      alert("Recording Started");
    } catch (error) {
      console.error(error);
      alert("Microphone permission denied");
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current) {
      alert("No recording in progress");
      return;
    }

    recorderRef.current.onstop = async () => {
      try {
        const blob = new Blob(chunksRef.current, {
          type: "audio/webm",
        });

        const formData = new FormData();

        formData.append(
          "audio",
          blob,
          "voice.webm"
        );

        const response = await fetch(
          "http://localhost:5000/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        console.log(data);

        alert("Audio Uploaded Successfully");
      } catch (error) {
        console.error(error);
        alert("Upload Failed");
      }
    };

    recorderRef.current.stop();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black">
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
    </main>
  );
}