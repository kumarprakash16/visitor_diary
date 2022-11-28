import React, { useEffect, useState } from "react";
import UsersList from "../components/UsersList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";

const Users = () => {
  const {isLoading,error,sendRequest,clearError} = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL+"/user");
        setLoadedUsers(responseData.users);
      } catch (err) {

      }
    };
    fetchUsers();
  }, [sendRequest]);
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError}></ErrorModal>
      {isLoading && (
        <div className='center'>
          <LoadingSpinner />
        </div>
      )}
      <UsersList items={loadedUsers}></UsersList>
    </React.Fragment>
  );
};
export default Users;
