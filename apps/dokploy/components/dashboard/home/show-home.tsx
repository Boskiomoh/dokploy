import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Server } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";


type DeploymentStatus = "idle" | "running" | "done" | "error";

const statusDotClass: Record<string, string> = {
	done: "bg-emerald-500",
	running: "bg-amber-500",
	error: "bg-red-500",
	idle: "bg-muted-foreground/40",
};

function getServiceInfo(d: any) {
	const app = d.application;
	const comp = d.compose;
	const serverName: string =
		d.server?.name ?? app?.server?.name ?? comp?.server?.name ?? "Nobus Cloud";
	if (app?.environment?.project && app.environment) {
		return {
			name: app.name as string,
			environment: app.environment.name as string,
			projectName: app.environment.project.name as string,
			serverName,
			href: `/dashboard/project/${app.environment.project.projectId}/environment/${app.environment.environmentId}/services/application/${app.applicationId}`,
		};
	}
	if (comp?.environment?.project && comp.environment) {
		return {
			name: comp.name as string,
			environment: comp.environment.name as string,
			projectName: comp.environment.project.name as string,
			serverName,
			href: `/dashboard/project/${comp.environment.project.projectId}/environment/${comp.environment.environmentId}/services/compose/${comp.composeId}`,
		};
	}
	return null;
}

function StatCard({
	label,
	value,
	delta,
}: {
	label: string;
	value: string;
	delta?: string;
}) {
	return (
		<div className="rounded-xl shadow-sm bg-background p-5 min-h-[140px] flex flex-col justify-between">
			<span className="text-xs uppercase tracking-wider text-muted-foreground">
				{label}
			</span>
			<div className="flex flex-col gap-1">
				<span className="text-3xl font-semibold tracking-tight">{value}</span>
				{delta && (
					<span className="text-xs text-muted-foreground">{delta}</span>
				)}
			</div>
		</div>
	);
}

function StatusListCard({
	label,
	items,
}: {
	label: string;
	items: { dotClass: string; label: string; count: number }[];
}) {
	return (
		<div className="rounded-xl shadow-sm bg-background p-5 min-h-[140px] flex flex-col gap-3">
			<span className="text-xs uppercase tracking-wider text-muted-foreground">
				{label}
			</span>
			<ul className="flex flex-col gap-1.5">
				{items.map((item) => (
					<li key={item.label} className="flex items-center gap-2.5 text-sm">
						<span
							className={`size-2 rounded-full shrink-0 ${item.dotClass}`}
							aria-hidden
						/>
						<span className="font-semibold tabular-nums w-8">{item.count}</span>
						<span className="text-muted-foreground">{item.label}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

export const ShowHome = () => {
	const { data: auth } = api.user.get.useQuery();
	const { data: homeStats } = api.project.homeStats.useQuery();
	const { data: permissions } = api.user.getPermissions.useQuery();
	const canReadDeployments = !!permissions?.deployment.read;
	const { data: deployments } = api.deployment.allCentralized.useQuery(
		undefined,
		{
			enabled: canReadDeployments,
			refetchInterval: 10000,
		},
	);

	const firstName = auth?.user?.firstName?.trim();

	const totals = homeStats ?? {
		projects: 0,
		environments: 0,
		applications: 0,
		compose: 0,
		databases: 0,
		services: 0,
	};
	const statusBreakdown = homeStats?.status ?? {
		running: 0,
		error: 0,
		idle: 0,
	};

	const recentDeployments = useMemo(() => {
		if (!deployments) return [];
		return [...deployments]
			.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			)
			.slice(0, 10);
	}, [deployments]);

	const deployStats = useMemo(() => {
		const now = Date.now();
		const weekMs = 7 * 24 * 60 * 60 * 1000;
		const lastStart = now - weekMs;
		const prevStart = now - 2 * weekMs;

		const last: NonNullable<typeof deployments> = [];
		const prev: NonNullable<typeof deployments> = [];
		for (const d of deployments ?? []) {
			const t = new Date(d.createdAt).getTime();
			if (t >= lastStart) last.push(d);
			else if (t >= prevStart) prev.push(d);
		}

		const lastCount = last.length;
		const prevCount = prev.length;
		let delta: string | undefined;
		if (prevCount > 0) {
			const pct = Math.round(((lastCount - prevCount) / prevCount) * 100);
			delta = `${pct >= 0 ? "+" : ""}${pct}% vs prev 7d`;
		} else if (lastCount > 0) {
			delta = "no prior data";
		} else {
			delta = "no activity yet";
		}

		return { value: String(lastCount), delta };
	}, [deployments]);

	return (
		<div className="w-full">
			<div className="flex flex-col gap-6 h-full p-2">
					<div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
						<h1 className="text-3xl font-semibold tracking-tight">
							{firstName ? `Welcome back, ${firstName}` : "Welcome back"}
						</h1>
						<Button asChild variant="secondary" className="w-fit">
							<Link href="/dashboard/projects">
								Go to projects
								<ArrowRight className="size-4" />
							</Link>
						</Button>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<StatCard
							label="Projects"
							value={String(totals.projects)}
							delta={`${totals.environments} ${totals.environments === 1 ? "environment" : "environments"}`}
						/>
						<StatCard
							label="Services"
							value={String(totals.services)}
							delta={`${totals.applications} apps · ${totals.compose} compose · ${totals.databases} db`}
						/>
						<StatCard
							label="Deploys / 7d"
							value={deployStats.value}
							delta={deployStats.delta}
						/>
						<StatusListCard
							label="Status"
							items={[
								{
									dotClass: "bg-emerald-500",
									label: "running",
									count: statusBreakdown.running,
								},
								{
									dotClass: "bg-red-500",
									label: "errored",
									count: statusBreakdown.error,
								},
								{
									dotClass: "bg-muted-foreground/40",
									label: "idle",
									count: statusBreakdown.idle,
								},
							]}
						/>
					</div>

					<div className="rounded-xl shadow-sm bg-background">
						<div className="flex items-center justify-between px-5 py-4 border-b">
							<div className="flex items-center gap-2">
						<svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
							<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
							<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
							<path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
							<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
						</svg>
						<h2 className="text-sm font-semibold">Recent deployments</h2>
							</div>
							{canReadDeployments && (
								<Link
									href="/dashboard/deployments"
									className="text-xs text-muted-foreground hover:text-foreground transition-colors"
								>
									view all →
								</Link>
							)}
						</div>
						{!canReadDeployments ? (
					<div className="min-h-[400px] flex flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground p-10">
						<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
							<rect x="8" y="4" width="40" height="52" rx="4" fill="#e8f0fe" stroke="#c7d7fc" strokeWidth="1.5"/>
							<rect x="14" y="14" width="28" height="2.5" rx="1.25" fill="#0070f3" opacity="0.7"/>
							<rect x="14" y="21" width="20" height="2" rx="1" fill="#94a3b8"/>
							<rect x="14" y="27" width="24" height="2" rx="1" fill="#94a3b8"/>
							<rect x="14" y="33" width="16" height="2" rx="1" fill="#94a3b8"/>
							<circle cx="46" cy="46" r="12" fill="#0070f3"/>
							<path d="M41 46h10M46 41v10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
						</svg>
						<span className="font-medium text-foreground">No permission to view deployments.</span>
						<span className="text-xs">Contact your administrator to gain access.</span>
					</div>
						) : recentDeployments.length === 0 ? (
					<div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-center text-sm text-muted-foreground p-10">
						<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
							<rect x="10" y="6" width="44" height="56" rx="5" fill="#e8f0fe" stroke="#c7d7fc" strokeWidth="1.5"/>
							<rect x="17" y="17" width="30" height="3" rx="1.5" fill="#0070f3" opacity="0.8"/>
							<rect x="17" y="25" width="22" height="2.5" rx="1.25" fill="#cbd5e1"/>
							<rect x="17" y="31" width="26" height="2.5" rx="1.25" fill="#cbd5e1"/>
							<rect x="17" y="37" width="18" height="2.5" rx="1.25" fill="#cbd5e1"/>
							<circle cx="52" cy="52" r="14" fill="#0070f3" opacity="0.1" stroke="#0070f3" strokeWidth="1.5"/>
							<path d="M52 46v6l4 2" stroke="#0070f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							<circle cx="52" cy="52" r="6" stroke="#0070f3" strokeWidth="2" fill="none"/>
						</svg>
						<span className="font-medium text-foreground">No deployments yet</span>
						<span className="text-xs max-w-xs">Deploy your first application to see activity here.</span>
					</div>
						) : (
							<ul className="divide-y">
								{recentDeployments.map((d) => {
									const info = getServiceInfo(d);
									if (!info) return null;
									const status = (d.status ?? "idle") as DeploymentStatus;
									return (
										<li key={d.deploymentId}>
											<Link
												href={info.href}
												className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors"
											>
												<span
													className={`size-2 rounded-full shrink-0 ${statusDotClass[status] ?? statusDotClass.idle}`}
													aria-hidden
												/>
												<div className="flex flex-col min-w-0 flex-1">
													<span className="text-sm truncate">{info.name}</span>
													<span className="text-xs text-muted-foreground truncate">
														{info.projectName} · {info.environment}
													</span>
												</div>
												<span className="text-xs text-muted-foreground w-36 hidden lg:flex items-center justify-end gap-1.5 truncate">
													<Server className="size-3 shrink-0" />
													<span className="truncate">{info.serverName}</span>
												</span>
												<span className="text-xs text-muted-foreground w-20 text-right hidden sm:inline">
													{status}
												</span>
												<span className="text-xs text-muted-foreground w-24 text-right hidden md:inline">
													{formatDistanceToNow(new Date(d.createdAt), {
														addSuffix: true,
													})}
												</span>
												<span className="text-xs text-muted-foreground hover:text-foreground transition-colors">
													logs →
												</span>
											</Link>
										</li>
									);
								})}
							</ul>
						)}
					</div>
			</div>
		</div>
	);
};
