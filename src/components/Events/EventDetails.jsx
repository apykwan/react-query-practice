import { useState } from 'react';
import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from "@tanstack/react-query";

import Header from '../Header.jsx';
import Modal from "../UI/Modal.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { queryClient, deleteEvent, fetchEvent } from "../../util/http";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const { 
    mutate, 
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: deleteError 
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['events'], 
        refetchType: 'none'
      });
      navigate("/events");
    }
  });

  function handleDelete() {
    mutate({ id });
  }

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }

  const { 
    data,
    isPending,
    isError,
    error 
  } = useQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  let content;

  if (isPending) content = (
    <div id="event-details-content" className="center">
      <p>Fetching data...</p>
    </div>
  );
  if (isError) content = (
    <div id="event-details-content" className="center">
      <ErrorBlock
        Block
        title="An error occurred"
        message={error.info.message || "Failed to fetch events"}
      />
    </div>
  );

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
    content = (
      <div id="event-details-content">
        <img src={`http://localhost:3000/${data.image}`} alt="" />
        <div id="event-details-info">
          <div>
            <p id="event-details-location">{data.location}</p>
            <time dateTime={`Todo-DateT$Todo-Time`}>{`${formattedDate} ${data.time}`}</time>
          </div>
          <p id="event-details-description">{data.description}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>Do you really wan tto delete this event?</p>
          {isPendingDeletion ? (
            <p>Deleting, Please wait...</p>
          ): (
            <div className="form-actions">
              <button className="button-text" onClick={handleStopDelete}>Cancel</button>
              <button className="button" onClick={handleDelete}>Delete</button>
            </div>
          )}
          {isErrorDeleting && <ErrorBlock title="Fail to delete event" message={deleteError.info.message || 'Delete failed'}/>}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        <header>
          <h1>{data && data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        {content}
      </article>
    </>
  );
}
