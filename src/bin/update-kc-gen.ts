import type { BuildContext } from "./shared/buildContext";
import * as fs from "fs/promises";
import { join as pathJoin } from "path";
import { existsAsync } from "./tools/fs.existsAsync";
import { maybeDelegateCommandToCustomHandler } from "./shared/customHandler_delegate";
import { runFormat } from "./tools/runFormat";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    const { hasBeenHandled } = maybeDelegateCommandToCustomHandler({
        commandName: "update-kc-gen",
        buildContext
    });

    if (hasBeenHandled) {
        return;
    }

    const filePath = pathJoin(buildContext.themeSrcDirPath, `kc.gen.tsx`);

    const currentContent = (await existsAsync(filePath))
        ? await fs.readFile(filePath)
        : undefined;

    const hasLoginTheme = buildContext.implementedThemeTypes.login.isImplemented;
    const hasAccountTheme = buildContext.implementedThemeTypes.account.isImplemented;

    const newContent = Buffer.from(
        [
            ``,
            `// This file is auto-generated by Keycloakify, do not modify it manually.`,
            ``,
            `import { lazy, Suspense, type ReactNode } from "react";`,
            ``,
            `export type ThemeName = ${buildContext.themeNames.map(themeName => `"${themeName}"`).join(" | ")};`,
            ``,
            `export const themeNames: ThemeName[] = [${buildContext.themeNames.map(themeName => `"${themeName}"`).join(", ")}];`,
            ``,
            `export type KcEnvName = ${buildContext.environmentVariables.length === 0 ? "never" : buildContext.environmentVariables.map(({ name }) => `"${name}"`).join(" | ")};`,
            ``,
            `export const kcEnvNames: KcEnvName[] = [${buildContext.environmentVariables.map(({ name }) => `"${name}"`).join(", ")}];`,
            ``,
            `export const kcEnvDefaults: Record<KcEnvName, string> = ${JSON.stringify(
                Object.fromEntries(
                    buildContext.environmentVariables.map(
                        ({ name, default: defaultValue }) => [name, defaultValue]
                    )
                ),
                null,
                2
            )};`,
            ``,
            `export type KcContext =`,
            hasLoginTheme && `    | import("./login/KcContext").KcContext`,
            hasAccountTheme && `    | import("./account/KcContext").KcContext`,
            `    ;`,
            ``,
            `declare global {`,
            `    interface Window {`,
            `        kcContext?: KcContext;`,
            `    }`,
            `}`,
            ``,
            hasLoginTheme &&
                `export const KcLoginPage = lazy(() => import("./login/KcPage"));`,
            hasAccountTheme &&
                `export const KcAccountPage = lazy(() => import("./account/KcPage"));`,
            ``,
            `export function KcPage(`,
            `    props: {`,
            `        kcContext: KcContext;`,
            `        fallback?: ReactNode;`,
            `    }`,
            `) {`,
            `    const { kcContext, fallback } = props;`,
            `    return (`,
            `        <Suspense fallback={fallback}>`,
            `            {(() => {`,
            `                switch (kcContext.themeType) {`,
            hasLoginTheme &&
                `                    case "login": return <KcLoginPage kcContext={kcContext} />;`,
            hasAccountTheme &&
                `                    case "account": return <KcAccountPage kcContext={kcContext} />;`,
            `                }`,
            `            })()}`,
            `        </Suspense>`,
            `    );`,
            `}`,
            ``
        ]
            .filter(item => typeof item === "string")
            .join("\n"),
        "utf8"
    );

    if (currentContent !== undefined && currentContent.equals(newContent)) {
        return;
    }

    await fs.writeFile(filePath, newContent);

    runFormat({ packageJsonFilePath: buildContext.packageJsonFilePath });

    delete_legacy_file: {
        const legacyFilePath = filePath.replace(/tsx$/, "ts");

        if (!(await existsAsync(legacyFilePath))) {
            break delete_legacy_file;
        }

        await fs.unlink(legacyFilePath);
    }
}
