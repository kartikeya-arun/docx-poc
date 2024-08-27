import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import Papa from "papaparse";
import React, { useState } from "react";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import mammoth from "mammoth";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Preview = () => {
  //   const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewURL] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [docData, setDocData] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const fileUrl = URL.createObjectURL(selectedFile);
      setPreviewURL(fileUrl);

      //Handle CSV files
      if (selectedFile.type === "text/csv") {
        Papa.parse(selectedFile, {
          header: true,
          complete: (results) => {
            setCsvData(results.data);
            setDocData(null);
          },
        });
      }
      //Handle DOC/DOCX file
      else if (
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        selectedFile.type === "application/msword"
      ) {
        const reader = new FileReader();
        reader.onload = function (event) {
          mammoth
            .convertToHtml({ arrayBuffer: event.target.result })
            .then(function (result) {
              setDocData(result.value);
              setCsvData(null);
            })
            .done();
        };
        reader.readAsArrayBuffer(selectedFile);
      }
      //Handle PDF files
      else if (selectedFile.type === "application/pdf") {
        setDocData(null);
        setCsvData(null);
      } else {
        setDocData(null);
        setCsvData(null);
      }
    }
  };

  return (
    <>
      <main className="flex justify-center mx-3 my-9">
        <div className="flex flex-col items-center">
          <div
            className="flex border border-dotted w-28 h-20 justify-center items-center flex-col cursor-pointer"
            onClick={() => document.getElementById("fileInput").click()}
          >
            <FontAwesomeIcon size="1x" icon={faUpload} />
            <span>Upload</span>
          </div>

          <input
            id="fileInput"
            type="file"
            accept=".csv,.pdf,.doc,.docx"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {previewUrl && (
            <div className="mt-4 w-full border border-gray-300 p-2">
              {file.type === "application/pdf" ? (
                <embed
                  src={previewUrl}
                  type="application/pdf"
                  width="100%"
                  height="300ox"
                />
              ) : file.type === "text/csv" ? (
                <div className="overflow-auto max-h-40">
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr>
                        {csvData &&
                          Object.keys(csvData[0]).map((header, index) => (
                            <th key={index} className="py-2 px-4 border-b">
                              {header}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.map((row, rowIndex) => {
                        <tr key={rowIndex}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="py-2 px-4 border-b">
                              {value}
                            </td>
                          ))}
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              ) : docData ? (
                  <ReactQuill value={docData} readOnly={true} theme={"snow"} />
              ) : (
                <div className="text-center h-auto">
                  <p>{file.name}</p>
                </div>
              )}
              <div className="mt-2 text-center">
                <a
                  href={previewUrl}
                  download={file.name}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Download File
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Preview;