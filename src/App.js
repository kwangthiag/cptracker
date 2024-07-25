import logo from './logo.svg';
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [handle, setHandle] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [ratingChanges, setRatingChanges] = useState([]);
  const [recommendedProblem, setRecommendedProblem] = useState(null);
  const [error, setError] = useState(null);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
      setUserInfo(response.data.result[0]);

      const submissionsResponse = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
      setSubmissions(submissionsResponse.data.result);

      const ratingChangesResponse = await axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`);
      setRatingChanges(ratingChangesResponse.data);

      setError(null);  // Clear any previous error
    } catch (error) {
      console.error('Error fetching user info:', error);
      setUserInfo(null);
      setSubmissions([]);
      setRatingChanges([]);
      setError('Failed to fetch user information. Please check the handle and try again.');
    }
  };

  const recommendAProblem = async () => {
    if (userInfo === null) {
      setUserInfo(null);
      setError('User information not available');
      return;
    }
    try {
      const problemsResponse = await axios.get('https://codeforces.com/api/problemset.problems');
      const problems = problemsResponse.data.result.problems;
      const solvedProblemIds = new Set(submissions.map(submission => `${submission.problem.contestId}-${submission.problem.index}`));
      const unsolvedProblems = problems.filter(problem => (problem.rating - userInfo.rating >= -100) 
        && (problem.rating - userInfo.rating <= 200) 
        && !solvedProblemIds.has(`${problem.contestId}-${problem.index}`));

      if (unsolvedProblems.length === 0) {
        setError('No recommended problems found');
        setRecommendedProblem(null);
      } else {
        const randomIndex = Math.floor(Math.random() * unsolvedProblems.length);
        setRecommendedProblem(unsolvedProblems[randomIndex]);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
      setError('Failed to fetch problems. Please try again later.');
    }
  }


  return (
    <div className="App">
      <header className="App-header">
        <p>
          Pick a donny
        </p>
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="Enter your Codeforces handle"
        />
        <button onClick={fetchUserInfo}>Fetch User Info</button>
        <button onClick={recommendAProblem}>Recommend a Problem</button>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {userInfo && (
          <div className="user-info">
            <h2>{userInfo.handle}</h2>
            <p>Rating: {userInfo.rating}</p>
            <p>Max Rating: {userInfo.maxRating}</p>
            <p>Rank: {userInfo.rank}</p>
            <p>Max Rank: {userInfo.maxRank}</p>
          </div>
        )}

        {recommendedProblem && (
          <div className="recommended-problem">
            <h2>Recommended Problem</h2>
            <p>
              <strong>{recommendedProblem.name}</strong> (Rating: {recommendedProblem.rating})
            </p>
            <p>
              <a
                href={`https://codeforces.com/problemset/problem/${recommendedProblem.contestId}/${recommendedProblem.index}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Problem
              </a>
            </p>
          </div>
        )}

        <a
          className="App-link"
          href="Codeforces"
          target="_blank"
          rel="noopener noreferrer"
        >
          Codeforces
        </a>
      </header>
    </div>
  );
}

export default App;
