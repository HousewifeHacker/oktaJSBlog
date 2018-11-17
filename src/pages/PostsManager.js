import React, { Component, Fragment } from 'react';
import { withAuth } from '@okta/okta-react';
import { withRouter, Route, Redirect, Link } from 'react-router-dom';
import {
    Typography,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
} from '@material-ui/core';
import { Delete as DeleteIcon, Add as AddIcon } from '@material-ui/icons';
import moment from 'moment';
import { find, orderBy } from 'lodash';
import { compose } from 'recompose';

import PostEditor from '../components/PostEditor';

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

    savePost = async (post) => {
        if (post.id) {
            //edit
            await this.fetch('put', `/posts/${post.id}`, post);
        } else {
            //new
            await this.fetch('post', '/posts', post);
        }

        //update PostsManager page and return to list
        this.props.history.goBack();
        this.getPosts();
    }

    async deletePost(post) {
        // confirms, deletes, updates posts on page
        // personally not a fan of this UX but cool demo of other option
        if (window.confirm(`Are you sure you want to delete "${post.title}"`)) {
            await this.fetch('delete', `/posts/${post.id}`);
            this.getPosts();
        }
    }

    renderPostEditor = ({ match: {params: { id } } }) => {
        if (this.state.loading) { return null; }
        const post = find(this.state.posts, { id: Number(id) });

        // error
        if (!post && id!=='new') { return <Redirect to="/posts" />; }

        //New or Edit
        return <PostEditor post={post} onSave={this.savePost} />

    };

    renderPostLink = (post) => {
        return (
            <ListItem key={post.id} button component={Link} to={`/posts/${post.id}`}>
                <ListItemText
                    primary={post.title}
                    secondary={post.updatedAt && `Updated ${moment(post.updatedAt).fromNow()}`}
                />
                <ListItemSecondaryAction>
                    <IconButton onClick={() => this.deletePost(post)} color="inherit">
                        <DeleteIcon />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        )
    }

    renderNoPosts = () => {
        return !this.state.loading && <Typography variant="subheading">No posts to display</Typography>
    }

    render() {
        const { classes } = this.props;

        return (
            <Fragment>
                <Typography variant="display1">Posts Manager</Typography>
                {!this.state.posts.length ? this.renderNoPosts() : (
                    <Paper elevation={1}>
                        <List>
                            {orderBy(this.state.posts, ['updatedAt', 'title'], ['desc', 'asc']).map(post => this.renderPostLink(post))}
                        </List>
                    </Paper>
                )}
                <Button
                    variant="fab"
                    color="secondary"
                    aria-label="add"
                    component={Link}
                    to="/posts/new"
                >
                    <AddIcon />
                </Button>
                <Route exact path="/posts/:id" render={this.renderPostEditor} />
            </Fragment>
        );
    }
}

export default compose(
    withAuth,
    withRouter
)(PostsManager);
