import { clsx } from "keycloakify/tools/clsx";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import { useI18n } from "../i18n";

export default function LoginX509Info(props: PageProps<Extract<KcContext, { pageId: "login-x509-info.ftl" }>>) {
    const { kcContext, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const { url, x509 } = kcContext;

    const { msg, msgStr } = useI18n({ kcContext });

    return (
        <Template {...{ kcContext, doUseDefaultCss, classes }} headerNode={msg("doLogIn")}>
            <form id="kc-x509-login-info" className={getClassName("kcFormClass")} action={url.loginAction} method="post">
                <div className={getClassName("kcFormGroupClass")}>
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="certificate_subjectDN" className={getClassName("kcLabelClass")}>
                            {msg("clientCertificate")}
                        </label>
                    </div>
                    {x509.formData.subjectDN ? (
                        <div className={getClassName("kcLabelWrapperClass")}>
                            <label id="certificate_subjectDN" className={getClassName("kcLabelClass")}>
                                {x509.formData.subjectDN}
                            </label>
                        </div>
                    ) : (
                        <div className={getClassName("kcLabelWrapperClass")}>
                            <label id="certificate_subjectDN" className={getClassName("kcLabelClass")}>
                                {msg("noCertificate")}
                            </label>
                        </div>
                    )}
                </div>
                <div className={getClassName("kcFormGroupClass")}>
                    {x509.formData.isUserEnabled && (
                        <>
                            <div className={getClassName("kcLabelWrapperClass")}>
                                <label htmlFor="username" className={getClassName("kcLabelClass")}>
                                    {msg("doX509Login")}
                                </label>
                            </div>
                            <div className={getClassName("kcLabelWrapperClass")}>
                                <label id="username" className={getClassName("kcLabelClass")}>
                                    {x509.formData.username}
                                </label>
                            </div>
                        </>
                    )}
                </div>
                <div className={getClassName("kcFormGroupClass")}>
                    <div id="kc-form-options" className={getClassName("kcFormOptionsClass")}>
                        <div className={getClassName("kcFormOptionsWrapperClass")} />
                    </div>
                    <div id="kc-form-buttons" className={getClassName("kcFormButtonsClass")}>
                        <div className={getClassName("kcFormButtonsWrapperClass")}>
                            <input
                                className={clsx(
                                    getClassName("kcButtonClass"),
                                    getClassName("kcButtonPrimaryClass"),
                                    getClassName("kcButtonLargeClass")
                                )}
                                name="login"
                                id="kc-login"
                                type="submit"
                                value={msgStr("doContinue")}
                            />
                            {x509.formData.isUserEnabled && (
                                <input
                                    className={clsx(
                                        getClassName("kcButtonClass"),
                                        getClassName("kcButtonDefaultClass"),
                                        getClassName("kcButtonLargeClass")
                                    )}
                                    name="cancel"
                                    id="kc-cancel"
                                    type="submit"
                                    value={msgStr("doIgnore")}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </Template>
    );
}
