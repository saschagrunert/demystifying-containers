import * as React from 'react';
import styled from 'react-emotion';
import { Slide, Heading } from 'spectacle';

const SubTitle = styled(Heading)`
    margin-top: 0.5em;
    font-size: 2em;
`;

export default (
    <Slide transition={['zoom']} bgColor="secondary">
        <Heading fit size={1} textColor="purple">
            Demystifying Containers
        </Heading>
        <SubTitle textColor="primary">Part I - Kernel Space</SubTitle>
    </Slide>
);
