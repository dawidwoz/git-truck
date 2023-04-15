export const treemapPadding = 17
export const bubblePadding = 10
export const textSpacingFromCircle = 0
export const searchMatchColor = "red"
export const estimatedLetterWidth = 7
export const EstimatedLetterHeightForDirText = 14
export const emptyGitCommitHash = "4b825dc642cb6eb9a060e54bf8d69288fbee4904"
export const gitLogRegex =
  /"author\s+<\|(?<author>.+?)\|>\s+date\s+<\|(?<date>\d+)\|>\s+message\s+<\|(?<message>(?:\s|.)+?)\|>\s+body\s+<\|(?<body>(?:\s|.)*?)\|>\s+hash\s+<\|(?<hash>.+?)\|>"\s+(?<contributions>(?:\s*.+\s+\|.*)+).*/gm
export const contribRegex = /(?<file>.*?)\s*\|\s*((?<contribs>\d+)|(?<bin>Bin)).*/gm
