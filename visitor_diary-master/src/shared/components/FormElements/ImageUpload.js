import "./ImageUpload.css";
import React, { useRef, useState, useEffect } from "react";
import Button from "./Button";

const ImageUpload = (props) => {
  const [isValid, setIsValid] = useState(false);
  const [previewUrl, setPreviewUrl] = useState();
  const [file, setFile] = useState();
  const filePickeref = useRef();

  useEffect(() => {
    if (!file) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  const pickedHandler = (event) => {
    let pickedFile;
    let fileIsValid = isValid;
    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      setFile(pickedFile);
      setIsValid(true);
      fileIsValid = true;
    } else {
      setIsValid(false);
      fileIsValid = false;
    }
    props.onInput(props.id, pickedFile, fileIsValid);
  };

  const pickImageHandler = () => {
    filePickeref.current.click();
  };

  return (
    <div className='form-control'>
      <input
        id={props.id}
        ref={filePickeref}
        style={{ display: "none" }}
        type='file'
        accept='.jpg,.png,.jpeg'
        onChange={pickedHandler}
      ></input>
      <div className={`image-upload ${props.center && "center"}`}>
        <div className='image-upload__preview'>
          {previewUrl && <img src={previewUrl} alt='preview'></img>}
          {!previewUrl && <p>Please pick an image.</p>}
        </div>
        <Button type='button' onClick={pickImageHandler}>
          Pick Image
        </Button>
      </div>
      {!isValid && <p>{props.errorText}</p>}
    </div>
  );
};

export default ImageUpload;
