import { useState } from "react"

export function Register(){

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    function handleUsernameChange(e){
        setUsername(e.target.value);
    }

    function handlePasswordChange(e){
        setPassword(e.target.value);
    }

    function register(e){
        e.preventDefault();
        console.log(`placeholder register with username ${username} and password ${password}`)
    }


    

    return(
        <div className='login'>
            <form>
            <header><h2>Register</h2></header>
            <div className='input-group'>
                <div>
                <label htmlFor='username'>Username</label>
                <input required name="username" type="text" value={username} onChange={handleUsernameChange}/>
                
                </div>
                <div>
                <label htmlFor='password'>Password</label>
                <input required type="password" name="password" value={password} onChange={handlePasswordChange}/>
                
                </div>
            </div>
            
            <footer>  
                <button type="submit" onClick={register}>Register</button>
            </footer>
            
            </form>
        </div>
    )
}