import React, { useEffect, useState } from "react";
import PlaceList from "../components/PlaceList";
import { useParams } from "react-router-dom";
import { useHttpClient } from "../../shared/hooks/http-hook";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";

const UserPlaces = (props) => {
  const userId = useParams().userId;
  const [loadedPlaces, setLoadedPlaces] = useState([]);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/places/user/${userId}`
        );
        setLoadedPlaces(responseData.places);
      } catch (err) {}
    };
    fetchPlaces();
  }, [sendRequest, userId]);
  const placeDeleteHandler=(deletedPlaceId)=>{
    setLoadedPlaces(prev=>prev.filter(place=>place.id!==deletedPlaceId))
  }
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError}></ErrorModal>
      {isLoading && (
        <div className='center'>
          <LoadingSpinner asOverlay />
        </div>
      )}
      {!isLoading && loadedPlaces && <PlaceList items={loadedPlaces} onDeletePlace={placeDeleteHandler}></PlaceList>}
    </React.Fragment>
  );
};
export default UserPlaces;
