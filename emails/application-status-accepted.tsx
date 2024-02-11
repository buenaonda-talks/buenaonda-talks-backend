import {
    Body,
    Button,
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
};

export const ApplicationStatusAcceptedEmail = ({ firstName }: Props) => {
    return (
        <Html>
            <Head />
            <Preview>Tu postulación ha sido aceptada</Preview>
            <Tailwind config={tailwindConfig}>
                <Body className="bg-[#f6f9fc] font-sans">
                    <Container className="bg-[#ffffff] mx-auto py-5 px-0 mb-64">
                        <Section className="px-12">
                            <Text className="font-bold tracking-widest uppercase">
                                BuenaOnda Talks
                            </Text>

                            <Hr className="border border-solid border-[#e6ebf1] my-5 mx-0 w-full" />

                            <Text className="text-slate-500 text-[16px] leading-[24px]">
                                Hola {firstName} 🎉,
                            </Text>

                            <Text className="text-slate-500 text-[16px] leading-[24px]">
                                ¡Felicidades! Tu postulación para obtener una beca de
                                BuenaOnda Talks ha sido aceptada. Estamos emocionados de
                                tenerte en nuestro programa.
                            </Text>

                            <Text className="text-slate-500 text-[16px] leading-[24px]">
                                Para continuar con el proceso, necesitamos que firmes los
                                términos y condiciones de la beca.
                            </Text>

                            <Button
                                className="bg-black rounded-lg text-white border border-solid border-black px-4 py-4"
                                href="https://buenaondatalks/dashboard"
                            >
                                Aceptar términos y condiciones
                            </Button>

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

export default ApplicationStatusAcceptedEmail;

ApplicationStatusAcceptedEmail.PreviewProps = {
    firstName: 'Ignacio',
};
