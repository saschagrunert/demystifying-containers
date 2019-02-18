import * as React from 'react';
import { Slide, Image, Heading } from 'spectacle';
import * as img from '../images';

export default (
    <Slide transition={['zoom']}>
        <Heading>Demystifying Containers</Heading>
        <Heading>Part I - Kernel Space</Heading>
        <Image src={img.images.logo} />
    </Slide>
);
