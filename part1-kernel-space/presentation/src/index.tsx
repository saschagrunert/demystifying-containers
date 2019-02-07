import Redbox from 'redbox-react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Presentation } from './presentation';
import { AppContainer } from 'react-hot-loader';

// tslint:disable-next-line:no-any
const CustomErrorReporter: React.SFC<{ error: any }> = ({ error }) => (
    <Redbox error={error} />
);

ReactDOM.render(<Presentation />, document.getElementById(
    'root',
) as HTMLElement);

ReactDOM.render(
    <AppContainer errorReporter={CustomErrorReporter}>
        <Presentation />
    </AppContainer>,
    document.getElementById('root'),
);

if (module.hot) {
    module.hot.accept('./presentation', () => {
        const NextPresentation = require('./presentation').default;
        ReactDOM.render(
            <AppContainer errorReporter={CustomErrorReporter}>
                <NextPresentation />
            </AppContainer>,
            document.getElementById('root'),
        );
    });
}
