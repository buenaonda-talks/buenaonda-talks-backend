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

export const ApplicationStatusDeclinedEmail = ({ firstName, observations }: Props) => {
    return (
        <Html>
            <Head />
            <Preview>Tu postulación no ha sido aceptada</Preview>
            <Tailwind config={tailwindConfig}>
                <Body className="bg-[#f6f9fc] font-sans">
                    <Container className="bg-[#ffffff] mx-auto py-5 px-0 mb-64">
                        <Section className="px-12">
                            <Text className="font-bold tracking-widest uppercase">
                                BuenaOnda Talks
                            </Text>

                            <Hr className="border border-solid border-[#e6ebf1] my-5 mx-0 w-full" />

                            <Text className="text-slate-500 text-[16px] leading-[24px]">
                                Hola {firstName},
                            </Text>

                            <Text className="text-slate-500 text-[16px] leading-[24px]">
                                Lamentablemente, tu postulación para obtener una beca de
                                BuenaOnda Talks no ha sido aceptada. Agradecemos tu
                                interés y te animamos a seguir postulándote en futuras
                                convocatorias.
                            </Text>

                            {observations?.length ? (
                                <>
                                    <Text className="text-slate-500 text-[16px] leading-[24px]">
                                        La razón por la que tu postulación no ha sido
                                        aceptada es la siguiente:
                                    </Text>

                                    <Section className="bg-muted p-5 rounded">
                                        <Text className="text-muted-foreground text-[16px] leading-[24px] italic">
                                            &ldquo;
                                            {observations}
                                            &rdquo;
                                        </Text>
                                    </Section>
                                </>
                            ) : (
                                <Text className="text-slate-500 text-[16px] leading-[24px]">
                                    Generalmente esto ocurre debido a falta de compromiso
                                    reflejada en tu postulación.
                                </Text>
                            )}

                            <Text className="text-slate-500 text-[16px] leading-[24px]">
                                La buena noticia es que puedes postularte en futuras
                                convocatorias. Te mantendremos informado sobre futuras
                                oportunidades.
                            </Text>

                            <Hr className="border border-solid border-[#e6ebf1] my-5 mx-0 w-full" />

                            <Text>
                                Si aún tienes dudas puedes encontrar respuestas a la
                                mayoría de las preguntas y ponerte en contacto con
                                nosotros en nuestra{' '}
                                <Link href="https://buenaondatalks/dashboard/preguntas-frecuentes">
                                    sección de preguntas frecuentes
                                </Link>
                                .
                            </Text>
                            <Text>— El equipo de BuenaOnda Talks</Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default ApplicationStatusDeclinedEmail;

ApplicationStatusDeclinedEmail.PreviewProps = {
    firstName: 'Ignacio',
};
