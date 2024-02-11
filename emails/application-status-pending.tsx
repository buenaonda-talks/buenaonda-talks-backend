import {
    Body,
    Container,
    Head,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';
import * as React from 'react';
import tailwindConfig from 'tailwind.config';

type Props = {
    firstName: string;
    observations: string | null;
};

export const ApplicationStatusPendingEmail = ({ firstName, observations }: Props) => {
    return (
        <Html>
            <Head />
            <Preview>Tu postulación está pendiente de aceptación</Preview>
            <Tailwind config={tailwindConfig}>
                <Body className="bg-[#f6f9fc] font-sans">
                    <Container className="bg-[#ffffff] mx-auto py-5 px-0 mb-64">
                        <Section className="px-12">
                            <Text className="font-bold tracking-widest uppercase">
                                BuenaOnda Talks
                            </Text>

                            <Hr className="border border-solid border-[#e6ebf1] my-5 mx-0 w-full" />

                            <Text className="text-slate-500 text-[16px] leading-[24px]">
                                Hola {firstName} 👋,
                            </Text>

                            {observations?.length ? (
                                <>
                                    <Text className="text-slate-500 text-[16px] leading-[24px]">
                                        Tu postulación para obtener una beca de BuenaOnda
                                        Talks podría ser aceptada, pero no podemos hacerlo
                                        por el siguiente motivo:
                                    </Text>

                                    <Section className="bg-muted p-5 rounded">
                                        <Text className="text-muted-foreground text-[16px] leading-[24px] italic">
                                            &ldquo;{observations}&rdquo;
                                        </Text>
                                    </Section>
                                </>
                            ) : (
                                <Text className="text-slate-500 text-[16px] leading-[24px]">
                                    Tu postulación podría ser aceptada pero debido a
                                    alguna razón no podemos admitirla por el momento.
                                    Generalmente esto ocurre cuando no tienes conexión a
                                    internet o tienes problemas con tu computadora.
                                </Text>
                            )}

                            <Text className="text-slate-500 text-[16px] leading-[24px]">
                                Si crees que esto se trata de un error o tu situación
                                cambia por favor ponte en contacto a través de uno de los
                                medios de comunicación que puedes encontrar en nuestra{' '}
                                <Link href="https://buenaondatalks/dashboard/preguntas-frecuentes">
                                    sección de preguntas frecuentes
                                </Link>
                                .
                            </Text>

                            <Hr className="border border-solid border-[#e6ebf1] my-5 mx-0 w-full" />

                            <Text>— El equipo de BuenaOnda Talks</Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default ApplicationStatusPendingEmail;

ApplicationStatusPendingEmail.PreviewProps = {
    firstName: 'Ignacio',
};
