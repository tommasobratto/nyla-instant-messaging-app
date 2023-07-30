import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Check2, ThreeDotsVertical } from "react-bootstrap-icons"

import './Chats.css'

import { FlowState } from "utils/Utils"
import { getDateAndTime } from "utils/Dates"

import { FlowLayout } from "components/Common/Layout"
import { TextArea } from "components/Common/Inputs"
import { Button } from "components/Common/Buttons"

import chatAPI from "api/chatAPI"
import { ChatEditor } from "./ChatEditor"

function MessageEditor({ scrollTo }) {
    const { id } = useParams()
    const [content, setContent] = useState("")
    const [isSending, setSending] = useState(false)

    return <div className="card-1">
        <div className="d-flex flex-row gap-2 align-items-center">
            <TextArea rows={1} className="flex-grow-1" value={content} placeholder="Write yout message here..."
                onChange={(ev) => setContent(ev.target.value)} />
            <div>
                <Button isDisabled={isSending || content === ""} onClick={() => {
                    setSending(true)
                    chatAPI.sendMessage(id, { content: content }).then(() => {
                        setContent("")
                        scrollTo()
                        setSending(false)
                    }).catch(err => {
                        console.log(err)
                    })
                }}><Check2 /></Button>
            </div>
        </div>
    </div>
}

function DateLabel({ date }) {
    return <div className="card-1">
        <p className="crd-subtitle text-center">{date}</p>
    </div>
}

function MessageCard({ message, user, prev, users }) {
    const [date, time] = getDateAndTime(message?.createdAt)
    const [prevDate, _] = prev ? getDateAndTime(prev.createdAt) : [null, null]

    const isFromOther = !message.sender.includes(user.id)
    const changedSender = prev ? message.sender.toString() !== prev.sender.toString() : true
    const alignment = isFromOther ? 'left' : 'right'
    const senderUsername = users.find(i => i.id === message.senderId)?.username
    const gap = changedSender ? 'mt-2' : ''

    return <>
        {date != prevDate && <DateLabel date={date} />}
        <div className={`d-flex flex-column card-1 limit-width ${alignment} ${gap}`}>
            {isFromOther && changedSender && <p className="crd-title">{senderUsername}</p>}
            <p className="m-0">{message.content}</p>
            <p className="crd-subtitle">{time}</p>
        </div>
    </>
}

function Chat({ user }) {
    const { id } = useParams()

    const [chat, setChat] = useState({})
    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState([])
    const [cursor, setCursor] = useState(null)

    const chatFlow = FlowState()
    const usersFlow = FlowState()
    const messagesFlow = FlowState()

    const [isEditing, setEditing] = useState(false)

    const [isNextVisible, setNextVisible] = useState(true)

    const lastMessageRef = useRef(null)

    useEffect(() => {
        chatFlow.setLoading()
        chatAPI.getChat(id).then(chat => {
            setChat(chat)
            chatFlow.setReady()
        }).catch(err => {
            console.log(err)
            chatFlow.setError()
        })

        chatAPI.getChatUsers(id).then(users => {
            setUsers(users)
            usersFlow.setReady()
        }).catch(err => {
            console.log(err)
            usersFlow.setError()
        })

        scrollToLast()
    }, [id])

    useEffect(() => {
        getMessages()
    }, [])

    const getMessages = () => {
        chatAPI.getMessages(id, cursor).then(({ messages, nextCursor }) => {
            if (nextCursor) setCursor(nextCursor)
            else setNextVisible(false)
            const revMessages = messages.reverse()
            setMessages(p => [...revMessages, ...p])
        }).catch(err => console.log(err))
    }

    const scrollToLast = () => { lastMessageRef.current.scrollIntoView() }

    return <div className="d-flex flex-column flex-grow-1 align-self-stretch mt-2 gap-2">
        {isEditing ? <ChatEditor chat={chat} close={() => setEditing(false)} /> : <>
            <FlowLayout state={chatFlow.toString()}>
                <loading></loading>
                <ready>
                    <div className="d-flex flex-row card-1 align-items-center gap-2">
                        <div className="d-flex flex-column flex-grow-1">
                            <p className="crd-title">{chat.name}</p>
                            {<p className="crd-subtitle">{`${users?.length} users`}</p>}
                        </div>
                        <div>
                            <Button onClick={() => setEditing(true)}><ThreeDotsVertical className="fore-2-btn" /></Button>
                        </div>
                    </div>
                </ready>
                <error></error>
            </FlowLayout>
            <div className="d-flex flex-column flex-grow-1 h-0 gap-2 scroll-y">
                {isNextVisible && <Button onClick={() => getMessages()}>Get Previous Messages...</Button>}
                {messages.map((message, i, arr) => <MessageCard key={message.id}
                    message={message}
                    user={user}
                    prev={i > 0 ? arr[i - 1] : null}
                    users={users} />)}
                <div ref={lastMessageRef}></div>
            </div>
            <MessageEditor scrollTo={scrollToLast} /></>}
    </div>
}

export { Chat }