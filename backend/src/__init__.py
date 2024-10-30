from pathlib import Path

import toml


def get_version() -> str:
    pyproject_toml_file = Path(__file__).parent.parent / "pyproject.toml"
    if pyproject_toml_file.exists() and pyproject_toml_file.is_file():
        data = toml.load(pyproject_toml_file)
        # check project.version
        if "project" in data and "version" in data["project"]:
            return data["project"]["version"]
        # check tool.poetry.version
        elif (
            "tool" in data
            and "poetry" in data["tool"]
            and "version" in data["tool"]["poetry"]
        ):
            return data["tool"]["poetry"]["version"]
    return "unknown"


__version__ = get_version()
