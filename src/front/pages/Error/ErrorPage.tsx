import useLocale from "@/front/utils/useLocale";
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";
import errorPageStyle from "./errorPage.module.css";
import SimpleButton from "@/front/common/SimpleButton/SimpleButton";

const getErrorGuid = (status:string,tl:(key: string, altKey?: string) => string)=>{
  const altKey = "pages.ErrorPage.codes." + status;
  return {status:status,statusText:tl("statusText",altKey),description: tl("description",altKey), solutions: tl("solutions",altKey) as unknown as string[]};
};

const getErrorCode = (error: unknown): string => {
  console.log("error: ",error);
  if (isRouteErrorResponse(error)) {
    console.log(error.data);
    return String(error.status);
  } else if (error instanceof Error){
    return error.message;
  }
  return "DEFAULT";
};

// TODO
// Error title : status + message
// Error detailed description
// solution or suggestion (if any)
// brand identity (logo, color, etc) for user reassurance
// Go Home button
// Go Back button
// Maybe a button to report the error (copy error detail to clipboard and open github issue page)

// TODO: theme, fontsize, word break
const ErrorPage = () => {
  let error = getErrorCode(useRouteError());
  const tl = useLocale('pages.ErrorPage');
  const guide = getErrorGuid(error, tl);
  console.log(guide);
  const navigate = useNavigate();
  return (
<div className={errorPageStyle.container}>
      <div className={errorPageStyle.content}>
        <div className={errorPageStyle["error-icon"]}>⚠️</div>
        <div className={errorPageStyle["error-status"]}>STATUS: {guide.status}</div>
        <h1 className={errorPageStyle['error-status-text']}>{guide.statusText}</h1>
        <p className={errorPageStyle['error-description']}>
          {guide.description}
        </p>
        <div className={errorPageStyle['solution']}>
          <span className={errorPageStyle['solution-title']}>💡 {tl('solutions')}</span>
          <ul className={errorPageStyle['solution-list']}>
            {guide.solutions.map((sol, index) => (
              <li key={index}>{sol}</li>
            ))}
          </ul>
        </div>
      </div>

      <SimpleButton onClick={()=>navigate(-1)}>Go Back</SimpleButton>
      <SimpleButton onClick={()=>navigate('/')}>Go Home</SimpleButton>
      <div className={errorPageStyle['contact-info']}>
        <span className={errorPageStyle.email}>Contact : tempEmail@google.com</span>
      </div>
    </div>);

};
export default ErrorPage;