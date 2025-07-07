import React, { useContext } from "react";
import { GraphContext } from "../grapher/Grapher";
import "./details.css";

function Details() {
  const { state } = useContext(GraphContext);
  const selectedUser = state.selectedUser;

  return (
    <>
      <div className="details">
        <h1>Details</h1>
        {selectedUser && (
          <div>
            <p>
              <strong>Login:</strong> {selectedUser.login}
              <br />
              <strong>Location:</strong>{" "}
              {selectedUser.location ? selectedUser.location : " Private"}
              <br />
              <strong>Email:</strong>{" "}
              {selectedUser.email ? selectedUser.email : " Private"}
              <br />
              <strong>GitHub Profile:</strong>
              <br />{" "}
              <a href={selectedUser.html_url}>
                {selectedUser.html_url ? selectedUser.html_url : " Private"}
              </a>
            </p>
            <p>
              {" "}
              <a href={selectedUser.html_url}>
                {" "}
                <img
                  className="avatar"
                  src={selectedUser.avatar_url}
                  alt={selectedUser.login}
                />
              </a>
            </p>
            <p>
              <strong>Company:</strong>
              {selectedUser.company ? selectedUser.company : " Private"}
            </p>
            <p>
              <strong>Bio:</strong>
              {selectedUser.bio ? selectedUser.bio : " Private"}
            </p>
            <p>
              <strong>Followers:</strong>
              {selectedUser.followers ? selectedUser.followers : " Private"}
            </p>

            <p>
              <strong>Following:</strong>
              {selectedUser.following ? selectedUser.following : " Private"}
            </p>

            <p>
              <strong>Public Repos:</strong>
              {selectedUser.public_repos
                ? selectedUser.public_repos
                : " Private"}
            </p>
            <p>
              <strong>Blog:</strong>
              {selectedUser.blog ? selectedUser.blog : " Private"}
            </p>
            <p>
              <strong>Public Gists:</strong>
              {selectedUser.public_gists
                ? selectedUser.public_gists
                : " Private"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default Details;
