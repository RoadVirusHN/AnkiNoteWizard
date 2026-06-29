import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";
import errorPageStyle from "./errorPage.module.css";
import { FallbackProps } from "react-error-boundary";
import SimpleButton from "@/panel/components/Inputs/SimpleButton/SimpleButton";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
type Status = "400" | "401" | "402" | "403" | "404"|"408"|"500"|"storageError"|"unknownError" | string;

const getErrorGuide = (infos:{status: Status, message: string},t:TFunction<"error", undefined>)=>{
  let res = {
    description: "",
    statusText: "",
    solutions: [] as string[],
  } 
  if (typeof infos.status === "string") {
    infos.status = "unknownError";
  }
  let altKey = "codes." + infos.status;
  //@ts-ignore
  res.statusText = t(altKey + ".statusText") as string; // Ignore type error
  //@ts-ignore
  res.solutions = t(altKey + ".solutions") as unknown as string[]; // Ignore type error
  //@ts-ignore
  res.description = t(altKey + ".description") as string; // Ignore type error
  if (infos.message.length > 0){
    res.description = infos.message; 
  }  
  return {status: infos.status, statusText: res.statusText, description: res.description, solutions: res.solutions};
};

const getErrorInfo = (error: unknown): {status: string, message: string} => {
  console.log("error: ",error);
  if (isRouteErrorResponse(error)) {
    console.log(error.data);
    return {status: String(error.status),message: error.data?.message || error.statusText || "An error occurred while loading the page."};
  } else if (error instanceof Error){
    return {status: error.name, message: error.message};
  }
  return {status: "Unknown Error", message: "An unexpected error has occurred."};
};

// TODO: Responsive, runtime error and route error handling
const ErrorPage = ({ error: runtimeError, resetErrorBoundary }: Partial<FallbackProps>) => {
  let infos = getErrorInfo(runtimeError ?? useRouteError());
  const {t} = useTranslation('error');
  const guide = getErrorGuide(infos, t);
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
          <span className={errorPageStyle['solution-title']}>💡 {t('solutions')}</span>
          <ul className={errorPageStyle['solution-list']}>
            {guide.solutions.map((sol, index) => (
              <li key={index}>{sol}</li>
            ))}
          </ul>
        </div>
      </div>
      <SimpleButton onClick={()=>{
        resetErrorBoundary?.();
        navigate('/',{replace: true});//replace to avoid user go home to error page again
        // No Go back button for prevent error page loop
      }}>Go Home</SimpleButton>
      <div className={errorPageStyle['contact-info']}>
        <span className={errorPageStyle.email}>Contact : tempEmail@google.com</span>
      </div>
    </div>);

};
export default ErrorPage;