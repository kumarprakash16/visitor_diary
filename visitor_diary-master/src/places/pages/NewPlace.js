import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import "./NewPlace.css";
import Input from "../../shared/components/FormElements/Input";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import Button from "../../shared/components/FormElements/Button";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";

const NewPlace = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const [formState, inputHandler] = useForm(
    {
      title: { value: "", isValid: false },
      description: { value: "", isValid: false },
      address: { value: "", isValid: false },
      image:{value:null,isValid:false},
    },
    false
  );
    const history=useHistory();
  const placeSubmitHandler = async (event) => {
    event.preventDefault();
    //formsate.input to backend
    try {
    const formdata = new FormData();
    formdata.append('title',formState.inputs.title.value);
    formdata.append('image',formState.inputs.image.value);
    formdata.append('description',formState.inputs.description.value);
    formdata.append('address',formState.inputs.address.value);
    
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL+'/places',
        "POST",
        formdata,
        {Authorization:'Bearer ' + auth.token
        }
      );
      history.push('/');
    } catch (err) {}
  };

  return (
    <React.Fragment>
      {isLoading && <LoadingSpinner asOverlay />}
      <ErrorModal error={error} onClear={clearError}></ErrorModal>
      <form className='place-form' onSubmit={placeSubmitHandler}>
        <Input
          id='title'
          element='input'
          type='text'
          label='Title'
          validators={[VALIDATOR_REQUIRE()]}
          errorText='Please enter a valid Title'
          onInput={inputHandler}
        ></Input>
        <ImageUpload id='image' onInput={inputHandler} errorText="please provide an image."></ImageUpload>
        <Input
          id='description'
          element='textarea'
          type='text'
          label='Description'
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText='Please enter a valid Description(at least 5 characters)'
          onInput={inputHandler}
        ></Input>

        <Input
          id='address'
          element='input'
          type='text'
          label='Address'
          validators={[VALIDATOR_REQUIRE()]}
          errorText='Please enter a valid address'
          onInput={inputHandler}
        ></Input>
        <Button type='submit' disabled={!formState.isValid}>
          Add Place
        </Button>
      </form>
    </React.Fragment>
  );
};
export default NewPlace;
