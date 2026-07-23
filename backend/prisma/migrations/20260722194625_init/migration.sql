-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firebaseUid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT NOT NULL DEFAULT 'GENERAL',
    "personality" TEXT NOT NULL DEFAULT 'STRICT',
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "score" INTEGER,
    "overallScore" INTEGER,
    "technicalScore" INTEGER,
    "communicationScore" INTEGER,
    "confidenceScore" INTEGER,
    "problemSolvingScore" INTEGER,
    "dsaScore" INTEGER,
    "systemDesignScore" INTEGER,
    "codingScore" INTEGER,
    "projectsScore" INTEGER,
    "hrScore" INTEGER,
    "softSkillsScore" INTEGER,
    "hiringProbability" INTEGER,
    "strengths" TEXT NOT NULL DEFAULT '[]',
    "weaknesses" TEXT NOT NULL DEFAULT '[]',
    "improvementPlan" TEXT,
    "duration" INTEGER,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Interview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterviewMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interviewId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "questionType" TEXT,
    "score" INTEGER,
    "feedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InterviewMessage_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interviewId" TEXT,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "company" TEXT NOT NULL DEFAULT 'GENERAL',
    "source" TEXT,
    "contextId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Question_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "userId" TEXT,
    "content" TEXT NOT NULL,
    "score" INTEGER,
    "feedback" TEXT,
    "timeSpent" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "technicalScore" INTEGER,
    "communicationScore" INTEGER,
    "confidenceScore" INTEGER,
    "problemSolvingScore" INTEGER,
    "dsaScore" INTEGER,
    "systemDesignScore" INTEGER,
    "codingScore" INTEGER,
    "projectsScore" INTEGER,
    "hrScore" INTEGER,
    "softSkillsScore" INTEGER,
    "hiringProbability" INTEGER,
    "strengths" TEXT NOT NULL DEFAULT '[]',
    "weaknesses" TEXT NOT NULL DEFAULT '[]',
    "improvementPlan" TEXT,
    "detailedFeedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feedback_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT,
    "content" TEXT NOT NULL,
    "parsedData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResumeAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "jobDescriptionId" TEXT,
    "atsScore" INTEGER,
    "matchScore" INTEGER,
    "skillsFound" TEXT NOT NULL DEFAULT '[]',
    "skillsMissing" TEXT NOT NULL DEFAULT '[]',
    "suggestions" TEXT NOT NULL DEFAULT '[]',
    "bulletRewrites" TEXT,
    "skillGap" TEXT NOT NULL DEFAULT '[]',
    "improvementPlan" TEXT,
    "interviewQuestions" TEXT NOT NULL DEFAULT '[]',
    "predictedDifficulty" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResumeAnalysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ResumeAnalysis_jobDescriptionId_fkey" FOREIGN KEY ("jobDescriptionId") REFERENCES "JobDescription" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobDescription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "company" TEXT,
    "content" TEXT NOT NULL,
    "extractedSkills" TEXT NOT NULL DEFAULT '[]',
    "extractedRequirements" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JobDescription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CodingSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL DEFAULT 'GENERAL',
    "title" TEXT,
    "language" TEXT NOT NULL DEFAULT 'javascript',
    "code" TEXT NOT NULL DEFAULT '',
    "problem" TEXT,
    "testCases" TEXT,
    "results" TEXT,
    "executionTime" INTEGER,
    "memoryUsage" INTEGER,
    "score" INTEGER,
    "feedback" TEXT,
    "timeSpent" INTEGER,
    "autoSaved" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CodingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Roadmap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "title" TEXT,
    "focusArea" TEXT,
    "generatedBy" TEXT NOT NULL DEFAULT 'ai',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Roadmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoadmapItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roadmapId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "topics" TEXT NOT NULL DEFAULT '[]',
    "resources" TEXT NOT NULL DEFAULT '[]',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoadmapItem_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChallengeSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "score" INTEGER,
    "feedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChallengeSubmission_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "DailyChallenge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChallengeSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GitHubAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "repositories" TEXT,
    "languages" TEXT,
    "commitActivity" TEXT,
    "projectQuality" TEXT,
    "interviewQuestions" TEXT NOT NULL DEFAULT '[]',
    "score" INTEGER,
    "suggestions" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GitHubAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PortfolioAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "performanceScore" INTEGER,
    "seoScore" INTEGER,
    "accessibilityScore" INTEGER,
    "projects" TEXT,
    "uiScore" INTEGER,
    "suggestions" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PortfolioAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "week" INTEGER,
    "month" INTEGER,
    "year" INTEGER NOT NULL,
    "interviewsCompleted" INTEGER NOT NULL DEFAULT 0,
    "averageScore" INTEGER,
    "topicsMastered" TEXT NOT NULL DEFAULT '[]',
    "weakTopics" TEXT NOT NULL DEFAULT '[]',
    "totalTimeSpent" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stripeSessionId" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Recruiter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InterviewInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recruiterId" TEXT NOT NULL,
    "candidateEmail" TEXT NOT NULL,
    "candidateName" TEXT,
    "interviewId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InterviewInvite_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "Recruiter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InterviewInvite_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Recruiter_email_key" ON "Recruiter"("email");
