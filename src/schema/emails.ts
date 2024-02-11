import { render } from '@react-email/render';
import { renderAsync } from '@react-email/components';
import { Message } from 'postmark';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const postmark = require('postmark');

type Options = Omit<Message, 'From' | 'HtmlBody'> & {
    POSTMARK_API_KEY: string;
    Component: React.ReactElement;
};

export const sendReactEmail = async ({
    POSTMARK_API_KEY,
    Component,
    ...options
}: Options) => {
    const client = new postmark.ServerClient(POSTMARK_API_KEY);

    const HtmlBody = render(Component);
    const TextBody = await renderAsync(Component, { plainText: true });

    return client.sendEmail({
        From: 'ignacio@9punto5.cl',
        HtmlBody: HtmlBody,
        TextBody: TextBody,
        ...options,
    });
};
