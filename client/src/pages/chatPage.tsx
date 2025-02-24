import React, { useEffect, useRef, useState } from "react";
import "../styles/chat-page.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import { io } from "socket.io-client";
import { getUsers } from "../api/getUsers";
import { getContacts } from "../api/getContacts";
import { getMessages } from "../api/getMessages";
import { BASE_URL } from "../config/constants";

const socket = io(BASE_URL);

export default function ChatPage() {
  const [userData, setUserData] = useState<
    { email: string; name: string; phone: string; userId: string }[]
  >([]);
  const [contacts, setContacts] = useState<
    {
      lastMessage: {
        message: string;
        timestamp: string;
        senderId: string;
        receiverId: string;
      };
      unseenMessageCount: number;
      email: string;
      name: string;
      phone: string;
      userId: string;
    }[]
  >([]);
  const [userId, setUserId] = useState("");
  const [receiver, setReceiver] = useState<{
    name: string;
    email: string;
    phone: string;
    userId: string;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<
    { senderId: string; receiverId: string; message: string; timestamp: Date }[]
  >([]);

  const [searchResult, setSearchResult] = useState<{
    name: string;
    email: string;
    phone: string;
    userId: string;
  } | null>(null);
  const [openInfoBar, setOpenInfoBar] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: string }>({});

  const fetchContacts = async (userId: string) => {
    const contacts = await getContacts(userId);
    console.log("contacts", contacts);
    setContacts(contacts);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await getUsers();
      setUserData(data);
    };
    fetchUserData();

    const newUserId = localStorage.getItem("userId");
    fetchContacts(newUserId || "");
    setUserId(newUserId || "");

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("join", newUserId);

    socket.on("receiveMessage", ({ senderId, receiverId, message }) => {
      setChat((prevChat) => [
        ...prevChat,
        {
          senderId,
          receiverId,
          message,
          timestamp: new Date(),
        },
      ]);
    });

    socket.on("onlineUsers", (onlineUsers) => {
      setOnlineUsers(onlineUsers);
    });

    const updateLastSeen = () => {
      socket.emit("updateLastSeen", newUserId);
    };
    window.addEventListener("beforeunload", updateLastSeen);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) updateLastSeen();
    });
    return () => {
      window.removeEventListener("beforeunload", updateLastSeen);
      document.removeEventListener("visibilitychange", updateLastSeen);
      socket.removeListener("receiveMessage");
      socket.disconnect();
    };
  }, []);

  const lastChatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (lastChatRef.current) {
      lastChatRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [chat]);

  const sendMessage = () => {
    if (message.trim() && receiver) {
      socket.emit("sendMessage", {
        senderId: userId,
        receiverId: receiver.userId,
        message,
      });
      setChat((prevChat) => [
        ...prevChat,
        {
          senderId: userId,
          receiverId: receiver.userId,
          message,
          timestamp: new Date(),
        },
      ]);
      setMessage("");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userData.length) {
      const user = userData.find(
        (item) => item.email == e.target.value || item.phone == e.target.value
      );
      if (user) {
        setSearchResult(user);
      } else {
        setSearchResult(null);
      }
    }
  };

  type User = {
    name: string;
    email: string;
    phone: string;
    userId: string;
  };
  const handleSelect = async (user: User) => {
    if (receiver) {
      //update last message of current contact if moving to another contact
      fetchContacts(userId);
    }
    //update new receiver contact
    setReceiver(user);

    //if opened after searching remove it from search list
    if (searchResult) setSearchResult(null);

    //add new messages on first opening
    const conversation = await getMessages(user.userId, userId);
    setChat(conversation);
  };

  const formatTime = (date: string | Date) => {
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    return parsedDate
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();

    const diffInMs = today.getTime() - d.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays < 7) {
      return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(d);
    }

    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const lastDateRef = useRef<string | null>(null);

  return (
    <section className="chat-page">
      <article className="chat-page-inner">
        <div className="side-bar">
          <div className="logo"></div>
          <div className="search">
            <i className="bi bi-search"></i>
            <input
              className="search-inner"
              type="text"
              placeholder="Search"
              onChange={handleSearch}
            />
          </div>
          <div className="contacts">
            {searchResult && (
              <div
                className="contact-info"
                onClick={() => handleSelect(searchResult)}
              >
                <div className="image">
                  {searchResult.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()}

                  <div
                    className="online-icon"
                    style={{
                      display: onlineUsers[searchResult.userId]
                        ? "block"
                        : "none",
                    }}
                  ></div>
                </div>
                <div className="content">
                  <span className="name">{searchResult.name}</span>
                  <span className="message"></span>
                </div>
                <div className="meta">
                  <span className="date"></span>
                  {/* <span className="message-count"></span> */}
                </div>
              </div>
            )}

            {!searchResult &&
              contacts.length > 0 &&
              contacts.map((contact, index) => (
                <div
                  key={index}
                  className={`contact-info ${
                    receiver !== null && receiver.userId == contact.userId
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleSelect(contact)}
                >
                  <div className="image">
                    {contact.name[0].toUpperCase()}
                    <div
                      className="online-icon"
                      style={{
                        display: onlineUsers[contact.userId] ? "block" : "none",
                      }}
                    ></div>
                  </div>
                  <div className="content">
                    <span className="name">{contact.name}</span>
                    <span className="message">
                      {chat.length > 0 &&
                      receiver &&
                      contact.userId === receiver.userId
                        ? chat[chat.length - 1].message
                        : contact.lastMessage.message}
                    </span>
                  </div>
                  <div className="meta">
                    <span className="date">
                      {formatTime(contact.lastMessage.timestamp)}
                    </span>
                    {contact.unseenMessageCount > 0 && (
                      <span className="message-count">
                        {contact.unseenMessageCount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="main">
          {receiver && (
            <>
              <div className="header" onClick={() => setOpenInfoBar(true)}>
                <div className="image"></div>
                <div className="name">{receiver.name}</div>
              </div>
              <div className="message-area">
                {chat.length > 0 &&
                  chat.map((item, i) => {
                    const msgDate = formatDate(item.timestamp);
                    const showDate = msgDate !== lastDateRef.current; // Only show if date has changed
                    lastDateRef.current = msgDate;
                    return (
                      <React.Fragment key={i}>
                        {showDate && <div className="date">{msgDate}</div>}
                        <div
                          className={`message-container ${
                            item.senderId === userId ? "message-2" : "message-1"
                          } `}
                          ref={i == chat.length - 1 ? lastChatRef : null}
                        >
                          <div className="message-text">{item.message}</div>
                          <div className="message-time">
                            {formatTime(new Date())}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
              </div>
              <div className="message-text-box">
                <input
                  type="text"
                  placeholder="Message"
                  onChange={(e) => setMessage(e.target.value)}
                  value={message}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                />
                <img
                  src="/send-button.png"
                  alt="send-button"
                  onClick={sendMessage}
                />
              </div>
            </>
          )}
        </div>
        <div className={`info-bar ${openInfoBar ? "width-full" : ""}`}>
          <div className="info-bar-inner">
            <i className="bi bi-x" onClick={() => setOpenInfoBar(false)}></i>
            {receiver && (
              <div className="details">
                <img src="/profile-image.png" alt="profile-image" />
                <span className="name">{receiver.name}</span>
                <span className="phone">{receiver.phone}</span>
                <span className="email">{receiver.email}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}
