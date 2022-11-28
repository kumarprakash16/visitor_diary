import React, { useState, useContext } from "react";
import "./Auth.css";
import Card from "../../shared/components/UIElements/Card";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import { AuthContext } from "../../shared/context/auth-context";

const Auth = (props) => {
  const auth = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const authSubmitHandler = async (event) => {
    event.preventDefault();

    if (isLoginMode) {
      try {
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL+"/user/login",
          "POST",
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }),
          {
            "Content-Type": "application/json",
          }
        );
        auth.login(responseData.userId,responseData.token);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        const formdata = new FormData();
        formdata.append("email", formState.inputs.email.value);
        formdata.append("password", formState.inputs.password.value);
        formdata.append("name", formState.inputs.name.value);
        formdata.append("image", formState.inputs.image.value);
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL+"/user/signup",
          "POST",
          formdata
        );

        auth.login(responseData.userId,responseData.token);
      } catch (err) {
        console.log(err);
      }
    }
  };
  const switchModeHandler = () => {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: "",
            isValid: false,
          },
          image: {
            value: null,
            isvalid: false,
          },
        },
        false
      );
    }
    setIsLoginMode((prevMode) => !prevMode);
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError}></ErrorModal>
      <Card className='authentication'>
        {isLoading && <LoadingSpinner asOverlay></LoadingSpinner>}
        <h2>Login Required</h2>
        <hr></hr>
        <form onSubmit={authSubmitHandler}>
          {!isLoginMode && (
            <Input
              element='input'
              id='name'
              type='text'
              label='Your Name'
              validators={[VALIDATOR_REQUIRE()]}
              errorText='please enter a name'
              onInput={inputHandler}
            />
          )}
          {!isLoginMode && (
            <ImageUpload center id='image' onInput={inputHandler} errorText="Please provide an image."></ImageUpload>
          )}
          <Input
            element='input'
            id='email'
            type='email'
            label='Email'
            validators={[VALIDATOR_EMAIL()]}
            errorText='Please enter a valid email'
            onInput={inputHandler}
          ></Input>
          <Input
            element='input'
            id='password'
            type='password'
            label='Password'
            validators={[VALIDATOR_MINLENGTH(6)]}
            errorText='Please enter a valid password (atleast 6 char long)'
            onInput={inputHandler}
          ></Input>
          <Button type='submit' disabled={!formState.isValid}>
            {isLoginMode ? "Login" : "SignUp"}
          </Button>
        </form>
        <Button type='submit' onClick={switchModeHandler}>
          Switch to {isLoginMode ? "SignUP" : "LOGIN"}
        </Button>
      </Card>
    </React.Fragment>
  );
};

export default Auth;
