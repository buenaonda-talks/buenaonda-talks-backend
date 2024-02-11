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

export const ApplicationStatusReceivedEmail = (props: Props) => {
    return (
        <Html>
            <Head />
            <Preview>Hemos recibido tu postulación y la estamos revisando</Preview>
            <Tailwind config={tailwindConfig}>
                <Body className="bg-[#f6f9fc] font-sans">
                    <Container className="bg-[#ffffff] mx-auto py-5 px-0 mb-64">
                        <Section className="px-12">
                            <Text className="font-bold tracking-widest uppercase">
                                BuenaOnda Talks
                            </Text>

                            <Hr className="border border-solid border-[#e6ebf1] my-5 mx-0 w-full" />

                            <Text className="text-slate-500 text-[16px] leading-[24px]">
                                Hola {props.firstName} 👋,
                            </Text>

                            <Text className="text-slate-500 text-[16px] leading-[24px]">
                                Te informamos que hemos recibido tu postulación para
                                obtener una de las becas de BuenaOnda Talks. Estamos
                                revisando tu postulación y te informaremos si has sido
                                seleccionado.
                            </Text>

                            <Text className="text-slate-500 text-[16px] leading-[24px]">
                                Podrás ver el estado de tu postulación y otra información
                                sobre tu cuenta desde tu dashboard.
                            </Text>

                            <Button
                                className="bg-black rounded-lg text-white border border-solid border-black px-4 py-4"
                                href="https://buenaondatalks/dashboard"
                            >
                                Ver tu dashboard de BuenaOnda Talks
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

export default ApplicationStatusReceivedEmail;

ApplicationStatusReceivedEmail.PreviewProps = {
    firstName: 'Ignacio',
};
