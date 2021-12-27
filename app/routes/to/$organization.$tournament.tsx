// TODO: 404 page that shows other tournaments by the organization

import {
  LinksFunction,
  LoaderFunction,
  ActionFunction,
  MetaFunction,
  NavLink,
  Outlet,
  useLoaderData,
} from "remix";
import invariant from "tiny-invariant";
import { AdminIcon } from "~/components/icons/Admin";
import { CheckinActions } from "~/components/tournament/CheckinActions";
import { InfoBanner } from "~/components/tournament/InfoBanner";
import { isTournamentAdmin } from "~/core/tournament/permissions";
import { tournamentHasStarted } from "~/core/tournament/utils";
import {
  checkIn,
  findTournamentByNameForUrl,
  FindTournamentByNameForUrlI,
} from "~/services/tournament";
import { makeTitle, requireUser } from "~/utils";
import type { MyCSSProperties } from "~/utils";
import { useUser } from "~/utils/hooks";
import tournamentStylesUrl from "../../styles/tournament.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tournamentStylesUrl }];
};

export enum TournamentAction {
  CHECK_IN = "CHECK_IN",
}

export const action: ActionFunction = async ({ request, context }) => {
  const data = Object.fromEntries(await request.formData());
  const user = requireUser(context);

  switch (data._action) {
    case TournamentAction.CHECK_IN: {
      invariant(typeof data.teamId === "string", "Invalid type for teamId");

      await checkIn({ teamId: data.teamId, userId: user.id });
      break;
    }
    default: {
      throw new Response("Bad Request", { status: 400 });
    }
  }
  return new Response(undefined, { status: 200 });
};

export const loader: LoaderFunction = ({ params }) => {
  invariant(
    typeof params.organization === "string",
    "Expected params.organization to be string"
  );
  invariant(
    typeof params.tournament === "string",
    "Expected params.tournament to be string"
  );

  return findTournamentByNameForUrl({
    organizationNameForUrl: params.organization,
    tournamentNameForUrl: params.tournament,
  });
};

export const meta: MetaFunction = (props) => {
  const data = props.data as FindTournamentByNameForUrlI | undefined;

  return {
    title: makeTitle(data?.name),
    //description: data.description ?? undefined,
  };
};

export default function TournamentPage() {
  const data = useLoaderData<FindTournamentByNameForUrlI>();
  const user = useUser();

  const navLinks = (() => {
    const result: { code: string; text: string; icon?: React.ReactNode }[] = [
      { code: "", text: "Overview" },
      { code: "map-pool", text: "Map Pool" },
      { code: "teams", text: `Teams (${data.teams.length})` },
    ];
    const tournamentIsOver = false;

    if (tournamentHasStarted(data.brackets)) {
      result.push({ code: `bracket/${data.brackets[0].id}`, text: "Bracket" });
      if (!tournamentIsOver) {
        result.push({ code: "streams", text: "Streams (4)" });
      }
    }

    const thereIsABracketToStart = data.brackets.some(
      (bracket) => bracket.rounds.length === 0
    );

    if (isTournamentAdmin({ userId: user?.id, organization: data.organizer })) {
      if (!tournamentHasStarted(data.brackets)) {
        result.push({ code: "seeds", text: "Seeds", icon: <AdminIcon /> });
      }
      result.push({ code: "edit", text: "Edit", icon: <AdminIcon /> });
      if (thereIsABracketToStart)
        result.push({ code: "start", text: "Start", icon: <AdminIcon /> });
    }

    return result;
  })();

  const tournamentContainerStyle: MyCSSProperties = {
    "--tournaments-bg": data.bannerBackground,
    "--tournaments-text": data.CSSProperties.text,
    "--tournaments-text-transparent": data.CSSProperties.textTransparent,
    // todo: could make a TS helper type for this that checks for leading --
  };

  const linksContainerStyle: MyCSSProperties = {
    "--tabs-count": navLinks.length,
  };

  return (
    <div className="tournament__container" style={tournamentContainerStyle}>
      <InfoBanner />
      <div className="tournament__container__spacer" />
      <div className="tournament__links-overflower">
        <div className="tournament__links-border">
          <div
            style={linksContainerStyle}
            className="tournament__links-container"
          >
            {navLinks.map(({ code, text, icon }) => (
              // TODO: on mobile keep the active link in center
              <NavLink
                key={code}
                className="tournament__nav-link"
                to={code}
                data-cy={`${code}-nav-link`}
                prefetch="intent"
                end
              >
                {icon} {text}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
      <div className="tournament__container__spacer" />
      <CheckinActions />
      <div className="tournament__outlet-spacer" />
      {/* TODO: pass context instead of useMatches */}
      <Outlet />
    </div>
  );
}
