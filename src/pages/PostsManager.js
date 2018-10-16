import React, { Component, Fragment } from 'react';
import { withAuth } from '@okta/okta-react';
import { withRouter, Route, Redirect, Link } from 'react-router-dom';
import {
    Typography,
    Button,
} from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import { compose } from 'recompose';

const API = process.env.REACT_APP_API || 'http://localhost:3001';

class PostsManager extends Component {
    state = {
        loading: true,
        posts: [],
    };

    componentDidMount() {
        this.getPosts();
    }

    // api is json and need accesstoken
    async fetch(method, endpoint, body) {
        try {
            const response = await fetch(`${API}${endpoint}`, {
                method,
                body: body && JSON.stringify(body),
                headers: {
                    'content-type': 'application/json',
                    accept: 'application/json',
                    authorization: `Bearer ${await this.props.auth.getAccessToken()}`
                },
            });
            return await response.json();
        } catch (error) {
            console.log(error);
        }
    }

    async getPosts() {
        this.setState({ loading: false, posts: await this.fetch('get', '/posts') })
    }

    render() {
        const { classes } = this.props;

        return (
            <Fragment>
                <Typography variant="display1">Posts Manager</Typography>
                {(!this.state.posts.length) && <Typography variant="subheading">No posts to display</Typography>}
                <Button
                    variant="fab"
                    color="secondary"
                    aria-label="add"
                >
                    <AddIcon />
                </Button>
            </Fragment>
        );
    }
}

export default compose(
    withAuth,
    withRouter
)(PostsManager);
