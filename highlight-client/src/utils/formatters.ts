export const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "-";
  }
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
};

export const formatCount = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return "0";
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `${Math.floor(value)}`;
};
