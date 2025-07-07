import React, { useContext } from "react";
import { GraphContext } from "../grapher/GraphApp";
import "./details.css";

function Details() {
  const { state } = useContext(GraphContext);
  const selectedUser = state.selectedUser;

  return (
    <>
      {console.log("Details Selected user:", selectedUser)}
      <div className="details">
        <h1>Details</h1>
        {selectedUser && (
          <div>
            <p>
              <strong>Login:</strong> {selectedUser.login}
              <br />
              <strong>Location:</strong>{" "}
              {selectedUser.location ? selectedUser.location : "N/A"}
              <br />
              <strong>Email:</strong>{" "}
              {selectedUser.email ? selectedUser.email : "N/A"}
              <br />
              <strong>GitHub Profile:</strong>
              <br />{" "}
              <a href={selectedUser.html_url}>
                {selectedUser.html_url ? selectedUser.html_url : "N/A"}
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
              {selectedUser.company ? selectedUser.company : "N/A"}
            </p>
            <p>
              <strong>Bio:</strong>
              {selectedUser.bio ? selectedUser.bio : "N/A"}
            </p>
            <p>
              <strong>Followers:</strong>
              {selectedUser.followers ? selectedUser.followers : "N/A"}
            </p>

            <p>
              <strong>Following:</strong>
              {selectedUser.following ? selectedUser.following : "N/A"}
            </p>

            <p>
              <strong>Public Repos:</strong>
              {selectedUser.public_repos ? selectedUser.public_repos : "N/A"}
            </p>
            <p>
              <strong>Blog:</strong>
              {selectedUser.blog ? selectedUser.blog : "N/A"}
            </p>
            <p>
              <strong>Public Gists:</strong>
              {selectedUser.public_gists ? selectedUser.public_gists : "N/A"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default Details;
