import { useEffect, useState } from "react"
import { Chat, ChatFill, Exclamation, ExclamationCircleFill, Person, PersonCircle, PersonFill, PersonXFill, Search, X, XCircleFill } from "react-bootstrap-icons"

import userAPI from 'api/userAPI'
import { FlowState } from "utils/Utils"

import { ErrorAlert, LoadingAlert } from "components/Alerts/Alerts"
import { Text } from "components/Common/Inputs"
import { FlowLayout } from "components/Common/Layout"

import './Users.css'

function UserCard({ user }) {
    return <div className="row-center card-1">
        <div className="crd-icon"><PersonFill className="fore-2 size-2" /></div>
        <div className="d-flex flex-column flex-grow-1">
            <p className="crd-title">{user.username}</p>
            <p className="crd-subtitle c-gray"><i>{user.bio}</i></p>
        </div>
        <Chat className="size-2 fore-2-btn" />
    </div>
}

function UsersSearch() {
    const [users, setUsers] = useState([])
    const [userSearch, setUserSearch] = useState("")
    const [userSearchDebounce, setUserSearchDebounce] = useState(null)

    const userSearchFlow = FlowState()

    useEffect(() => {
        userSearchFlow.setLoading()
        if (userSearchDebounce) clearTimeout(userSearchDebounce)
        setUserSearchDebounce(setTimeout(() => {
            userAPI.getUsers(userSearch).then((u) => {
                setUsers(u)
                userSearchFlow.setReady()
            }).catch(err => {
                userSearchFlow.setError()
            })
        }, 1000))
    }, [userSearch])


    return <div className="d-flex flex-column gap-2 mt-2 mb-2 align-self-stretch flex-grow-1 scroll-y h-0">
        <div className="d-flex flex-row gap-2">
            <Text title="User search:" autoComplete="new-password" value={userSearch} placeholder="Search by username..."
                onChange={(ev) => setUserSearch(ev.target.value)}
                left={<Search className="size-1 fore-2" />}
                right={userSearch === "" ? <></> : <XCircleFill onClick={() => setUserSearch("")} className="size-1 fore-2-btn" />} />
        </div>
        <div className="d-flex flex-column gap-3 flex-grow-1">
            <FlowLayout state={userSearchFlow.toString()}>
                <loading>
                    <div className="d-flex flex-grow-1 align-items-center justify-content-center m-2"><LoadingAlert /></div>
                </loading>
                <ready>
                    {users.length > 0 ? users.map(u => <UserCard key={u.id} user={u} />) :
                        <>
                            {userSearch === "" ? <div className="card-1 d-flex flex-row justify-content-center align-items-center gap-2">
                                <Person className="size-2 fore-2" />
                                <p className="m-0 text-center fore-2"><i>Mathing users will appear here...</i></p>
                            </div> : <div className="card-1 d-flex flex-row justify-content-center align-items-center gap-2">
                                <PersonXFill className="size-2 fore-2" />
                                <p className="m-0 text-center text-center fore-2"><i>No users found...</i></p>
                            </div>}
                        </>}
                </ready>
                <error>
                    <div className="d-flex flex-grow-1 align-items-center justify-content-center m-2"><ErrorAlert /></div>
                </error>
            </FlowLayout>
        </div>
    </div>
}

export { UsersSearch }