import React, { useEffect, useState,useContext } from "react";
import { useParams } from "react-router-dom";
import Button from "../../shared/components/FormElements/Button";
import Input from "../../shared/components/FormElements/Input";
import "./NewPlace.css";
import { useForm } from "../../shared/hooks/form-hook";
import Card from "../../shared/components/UIElements/Card";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import { useHttpClient } from "../../shared/hooks/http-hook";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../shared/context/auth-context";

const UpdatePlace = (props) => {
  const history = useHistory();
  const auth=useContext(AuthContext);
  const placeId = useParams().placeId;
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedPlace, setLoadedPlace] = useState();
  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`
        );
        setLoadedPlace(responseData.place);
        setFormData(
          {
            title: {
              value: responseData.place.title,
              isValid: true,
            },
            description: {
              value: responseData.place.description,
              isValid: true,
            },
          },
          true
        );
      } catch (err) {}
    };
    fetchPlace();
  }, [sendRequest, placeId, setFormData]);

  const placeUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    console.log(formState.inputs);
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`,
        "PATCH",
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
        }),
        { "Content-Type": "application/json",
          "Authorization":'Bearer ' + auth.token
       }
      );

      history.push("/"+auth.userId+'/places');
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <div className='center'>
        <LoadingSpinner></LoadingSpinner>
      </div>
    );
  }
  if (!loadedPlace && !error) {
    return (
      <div className='center'>
        <Card>
          <h2>Could not found place</h2>
        </Card>
      </div>
    );
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError}></ErrorModal>

      {!isLoading && loadedPlace && (
        <form className='place-form' onSubmit={placeUpdateSubmitHandler}>
          <Input
            id='title'
            element='input'
            type='text'
            label='Title'
            validators={[VALIDATOR_REQUIRE()]}
            errorText='please enter a valid Title'
            onInput={inputHandler}
            initialValue={loadedPlace.title}
            initialValid={true}
          ></Input>
          <Input
            id='description'
            element='textarea'
            label='Description'
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText='please enter a valid Description(atleast 5 cahr long)'
            onInput={inputHandler}
            initialValue={loadedPlace.description}
            initialValid={true}
          ></Input>
          <Button type='submit' disabled={!formState.isValid}>
            Update Place
          </Button>
        </form>
      )}
    </React.Fragment>
  );
};
export default UpdatePlace;
