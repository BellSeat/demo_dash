'use client'

import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import React, { FormEvent, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link';
// const VideoPlayer = dynamic(() => import('./dashVideo'));


export default function Home() {
  const [loaded, setLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [downloadFileList, setLoadFileList] = useState<{ fileBlob: string, name: string }[]>([])
  const [uploadFile, setUploadFile] = useState<FileList>({} as FileList);
  const ffmpegRef = useRef(new FFmpeg())
  const videoRef = useRef<string>(" ")
  const messageRef = useRef<HTMLParagraphElement | null>(null)

  const VideoPlayer = dynamic(() => import('./dashVideo'));
  const load = async () => {
    setIsLoading(true)
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd'
    const ffmpeg = ffmpegRef.current
    ffmpeg.on('log', ({ message }) => {
      if (messageRef.current) {
        messageRef.current.innerHTML = message;
        console.log(message);
      }
    })
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
    })
    setLoaded(true)
    setIsLoading(false)
  }

  const transcode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const ffmpeg = ffmpegRef.current
    if (uploadFile === null) {
      return;
    }
    await ffmpeg.writeFile(uploadFile[0].name, await fetchFile(uploadFile[0]));
    await ffmpeg.exec(['-i', uploadFile[0].name, '-f', 'dash', 'output.mpd'])
    // await ffmpeg.exec(['-i', 'input.avi', '-f', 'dash', 'output.mpd']);
    const data = (await ffmpeg.readFile('output.mpd'))
    console.log(data);

    videoRef.current = URL.createObjectURL(new Blob([data]))

    const fileNodes = await ffmpeg.listDir('/');
    const videoList: { fileBlob: string, name: string }[] = [];
    for (let i = 0; i < fileNodes.length; i++) {
      if (fileNodes[i].isDir)
        continue;
      const name: string = fileNodes[i].name;
      const newFile = new File([await ffmpeg.readFile(fileNodes[i].name)], fileNodes[i].name);
      const fileBlob = URL.createObjectURL(newFile);
      const newElement = { fileBlob, name };
      videoList.push(newElement);
    }
    setLoadFileList(videoList);
  }

  const addFile = async (e: FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    setUploadFile(e.currentTarget.files as FileList)
  }

  return (

    loaded ? (
      <div className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]" >
        <VideoPlayer videoURL='https://editedvideosean.s3.us-west-2.amazonaws.com/output/output.mpd' ></VideoPlayer>
        <br />
        <form onSubmit={(e) => { transcode(e) }}>
          <div>
            <input type='file' accept='video' onChange={(e) => { addFile(e); }} />
          </div>
          <button
            type='submit'
            className="bg-green-500 hover:bg-green-700 text-white py-3 px-6 rounded"
          >
            Transcode
          </button>
        </form>
        <p ref={messageRef}></p>

        <div>
          {downloadFileList.map((fileBlob, index) => {
            return (
              <li>
                <a href={fileBlob.fileBlob} download={fileBlob.name}>
                  {fileBlob.name}
                </a>
              </li>
            )
          })}
        </div>
      </div>

    ) : (
      <button
        className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
        onClick={load}
      >
        Load ffmpeg-core
        {isLoading && (
          <span className="animate-spin ml-3">
            <svg
              viewBox="0 0 1024 1024"
              focusable="false"
              data-icon="loading"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
            </svg>
          </span>
        )}
      </button>
    ));
}