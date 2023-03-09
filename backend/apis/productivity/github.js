import {Octokit} from "octokit";

const OCTOKIT = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN,
});


export const getGithubIssues = async (username, repository) => {
    let res;

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

    try {
        const GITHUB_RESPONSE = await OCTOKIT.request("GET /repos/{owner}/{repo}/issues", {
            owner: username,
            repo: repository,
        });
        res = processResponse(GITHUB_RESPONSE.data);
        console.log(res);
    } catch (error) {
        console.error(error);
    };

    //TODO: REFACTOR SO THAT PROPER ERROR HANDLING IS USED
    if (res) {
        return res;
    } else {
        return "ERROR";
    };

}

export const getGithubRepositories = async (username) => {
    let res;

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
    }

    try {
        const GITHUB_RESPONSE = await OCTOKIT.request("GET /users/{username}/repos", {
            username: username
        });
        console.log(GITHUB_RESPONSE);
        res = processResponse(GITHUB_RESPONSE.data);
        // res = GITHUB_RESPONSE;
        // console.log(res);
    } catch (error) {
        console.error(error);
    }

    //TODO: REFACTOR SO THAT PROPER ERROR HANDLING IS USED
    if (res) {
        return res;
    } else {
        throw new Error;
    }
};


export const getGithubRepositoryLanguages = async (username, repositories) => {
    let res = {};
    try {
        for (const R of repositories) {
            console.log("here");
            const GITHUB_RESPONSE = await OCTOKIT.request("GET /repos/{owner}/{repo}/languages", {
                owner: username,
                repo: R
            });
            res[R] = GITHUB_RESPONSE.data;
        };

        console.log(res);
    } catch (error) {
        console.error(error);
    }

    //TODO: REFACTOR SO THAT PROPER ERROR HANDLING IS USED
    if (res) {
        return res;
    } else {
        throw new Error;
    }

}