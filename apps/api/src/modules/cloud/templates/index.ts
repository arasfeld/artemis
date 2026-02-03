import { TemplateResult, welcomeTemplate } from './welcome.template';

type TemplateFunction = (data: Record<string, unknown>) => TemplateResult;

const templates: Record<string, TemplateFunction> = {
  welcome: welcomeTemplate as unknown as TemplateFunction,
};

export function getTemplate(name: string): TemplateFunction | undefined {
  return templates[name];
}

export { welcomeTemplate };
export type { TemplateResult };
export type { WelcomeTemplateData } from './welcome.template';
