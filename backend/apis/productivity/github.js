import { wrapResponse } from "../../utils/func.js";

export const getGithubIssues = async (username, repository, github_client) => {
    let error = {
        present: false,
        details: null
    };
    let data = {};

    const processResponse = (g_r) => {
        let processed_response = [];

        g_r.forEach((r) => {
            processed_response.push({
                issueTitle: r.title,
                labels: r.labels.forEach((l) => ({
                    name: l.name,
                    colour: l.color
                })),
                issueText: r.body,
                dateOfCreation: r.created_at,
                dateOfLastUpdate: r.updated_at
            });
        });

        return processed_response;
    };

    await github_client.request("GET /repos/{owner}/{repo}/issues", {
        owner: username,
        repo: repository,
    })
    .then((github_res) => {
        data = processResponse(github_res.data);
    })
    .catch((err) => {
        error = {
            present: true,
            details: err
        };
    });

    return wrapResponse(error, data);
};


export const getGithubRepositories = async (username, github_client) => {
    let error = {
        present: false,
        details: null
    };
    let data = {};

    const processResponse = (g_r) => {
        let processed_res = [];

        g_r.forEach((r) => {
            r.archived ? null : processed_res.push({
                repoName: r.name,
                repoFullName: r.full_name,
                description: r.description,
                dateOfCreation: r.created_at,
                dateOfLastUpdate: r.updated_at,
                size: r.size,
                language: r.language,
                visibility: r.visibility,
                numberOfOpenIssues: r.open_issues_count
            });
        });

        return processed_res;
    };

    await github_client.request("GET /users/{username}/repos", {
        username: username
    })
    .then((github_res) => {

        data = processResponse(github_res.data);

    })
    .catch((err) => { 
        console.error({err});

        error = {
            present: true,
            details: err
        };
        
    });

    return wrapResponse(error, data);

};


export const getGithubRepositoryLanguages = async (username, repositories, github_client) => {
    let error = {
        present: false,
        details: null
    };
    let data = {};

    for (const R of repositories) {

        await github_client.request("GET /repos/{owner}/{repo}/languages", {
            owner: username,
            repo: R
        })    
        .then((github_res) => {
            data[R] = github_res.data;
        })
        .catch((err) => {
            error = {
                present: true,
                details: err
            };
        });

    };

    return wrapResponse(error, data);
};


export async function getRateLimit(github_client) {
    let error = {
        present: false,
        details: null
    };
    let data = {};

    await github_client.request("GET /rate_limit")
        .then((github_res) => {
            data = github_res.data;
        })
        .catch((err) => {
            error = {
                present: true,
                details: err
            };
        });

    return wrapResponse(error, data);
};