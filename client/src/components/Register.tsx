import AuthForm from './Authform';
import frameC from "../assets/frameC.png";

// export default function Login() {
//   return <AuthForm mode="login" />;
// }

export default function Login() {
  return (
    <div className='flex h-full overflow-hidden w-full mt-12'>
      <div className='flex w-1/2 flex-row items-center justify-center ml-16'>
        <AuthForm mode="register" />
      </div>
      <div className='lg:flex hidden w-1/2 items-center justify-center'>
        <img src={frameC} alt="hello" height={850} width={650} className='ml-24' />
      </div>
    </div>
  )
}