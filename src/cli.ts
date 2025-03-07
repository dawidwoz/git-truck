import path from "path"
import pkg from "../package.json"
import open from "open"
import latestVersion from "latest-version"
import { GitCaller } from "./analyzer/git-caller.server"
import { getArgsWithDefaults, parseArgs } from "./analyzer/args.server"
import { getPathFromRepoAndHead } from "./util"
import { createApp } from "@remix-run/serve"
import { semverCompare } from "./components/util"
import { describeAsyncJob } from "./analyzer/util.server"
import { log, setLogLevel } from "./analyzer/log.server"

async function main() {
  const args = parseArgs()
  if (args?.log) {
    setLogLevel(args.log as string)
  }
  const options = getArgsWithDefaults()

  const currentV = pkg.version
  let updateMessage = ""
  try {
    const latestV = await latestVersion(pkg.name)

    // Soft clear the console
    process.stdout.write("\u001b[2J\u001b[0;0H")
    console.log()

    updateMessage =
      latestV && semverCompare(latestV, currentV) === 1
        ? ` [!] Update available: ${latestV}

To update, run:

npx git-truck@latest

Or to install globally:

npm install -g git-truck@latest

`
        : " (latest)"
  } catch (e) {
    // ignore
  }
  console.log(`Git Truck Beta version ${currentV}${updateMessage}\n`)

  if (args.h || args.help) {
    console.log()
    console.log(`See

${pkg.homepage}

for usage instructions.`)
    console.log()
    process.exit(0)
  }
  const getPortLib = await import("get-port")
  const getPort = getPortLib.default
  const port = await getPort({
    port: [...getPortLib.portNumbers(3000, 4000)],
  })

  // Serve application build

  const onListen = async () => {
    const url = `http://localhost:${port}`

    const [extension, extensionError] = await describeAsyncJob(
      async () => {
        // If CWD or path argument is a git repo, go directly to that repo in the visualizer
        if (await GitCaller.isGitRepo(options.path)) {
          const repo = await GitCaller.getRepoMetadata(options.path)
          if (repo) {
            return `/${getPathFromRepoAndHead(repo.name, repo.currentHead)}`
          } else return ""
        }
      },
      "Checking for git repo",
      "Done checking for git repo",
      "Failed to check for git repo"
    )

    if (extensionError) {
      console.error(extensionError)
    }

    if (process.env.NODE_ENV !== "development") {
      const openURL = url + (extension ?? "")
      log.debug(`Opening ${openURL}`)
      let err : Error | null = null

      if (!args.headless) {
        [, err] = await describeAsyncJob(
          () => open(openURL),
          "Opening Git Truck Beta in your browser",
          `Successfully opened Git Truck Beta in your browser`,
          `Failed to open Git Truck Beta in your browser. To continue, open this link manually:\n\n${openURL}`
        )
      }
      if (!err) console.log(`\nApplication available at ${url}`)
    }
  }

  describeAsyncJob(
    async () => {
      const app = createApp(
        path.join(__dirname, "build"),
        process.env.NODE_ENV ?? "production",
        "/build",
        path.join(__dirname, "public", "build")
      )

      const server = process.env.HOST ? app.listen(port, process.env.HOST, onListen) : app.listen(port, onListen)

      ;["SIGTERM", "SIGINT"].forEach((signal) => {
        process.once(signal, () => server?.close(console.error))
      })
    },
    "Starting Git Truck",
    "Git Truck Beta started",
    "Failed to start Git Truck"
  )
}

main()
