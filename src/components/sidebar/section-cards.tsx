//import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

//import { Badge } from "@/components/ui/badge.tsx";
import {
  Card,
  //CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {wareneingangApi} from "@/api/endpoints/wareneingangApi";
import {orderApi} from "@/api/endpoints/orderApi";
import {fertigmateriallagerApi} from "@/api/endpoints/fertigmateriallagerApi";
import {rohmateriallagerApi} from "@/api/endpoints/rohmateriallagerApi";


export function SectionCards() {
  const {
    data: wareneingangHeute,
    isLoading: isLoadingWE,
    error: errorWE,
  } = wareneingangApi.useGetWareneingangHeuteQuery();

  const {
    data: getOpenOrders,
    isLoading: isLoadingOrders,
    error: errorOrders,
  } = orderApi.useGetOpenOrdersQuery();

  const {
    data: getBestandFertigmaterial,
    isLoading: isLoadingBestandFertigmaterial,
    error: errorBestandFertigmaterial,
  } = fertigmateriallagerApi.useGetFertigmaterialQuery();

  const {
    data: getBestandRohmaterial,
    isLoading: isLoadingBestandRohmaterial,
    error: errorBestandRohmaterial,
  } = rohmateriallagerApi.useGetRohmaterialQuery();

  const summeHeute = wareneingangHeute?.length ?? 0
  const anzahlEingaengeArtikel = wareneingangHeute?.reduce((sum, item) => sum + item.menge, 0) ?? 0;

  const summeOpen = getOpenOrders?.length ?? 0
  const anzahlOffeneArtikel= getOpenOrders?.reduce((sum, order) => sum + order.menge, 0) ?? 0;

  const gesamtBestandFertigmaterial = getBestandFertigmaterial?.reduce((sum, item) => sum + item.menge, 0) ?? 0;
  const gesamtBestandRohmaterial = getBestandRohmaterial?.reduce((sum, item) => sum + item.menge, 0) ?? 0;

  if (isLoadingWE || isLoadingOrders||isLoadingBestandFertigmaterial||isLoadingBestandRohmaterial) {
    return <div>Lädt Daten...</div>;
  }

  if (errorWE || errorOrders|| errorBestandFertigmaterial||errorBestandRohmaterial) {
    return <div>Fehler beim Laden der Daten</div>;
  }
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Wareneingänge Heute</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {summeHeute}
          </CardTitle>
          { /*<CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>*/}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          { /*<div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month <IconTrendingUp className="size-4" />
          </div>*/}
          <div className="text-muted-foreground">
            Anzahl Artikel: {anzahlEingaengeArtikel}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Offene Bestellungen</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {summeOpen}
          </CardTitle>
          {/*<CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -20%
            </Badge>
          </CardAction>*/}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {/*<div className="line-clamp-1 flex gap-2 font-medium">
            Down 20% this period <IconTrendingDown className="size-4" />
          </div>*/}
          <div className="text-muted-foreground">
            Anzahl Artikel: {anzahlOffeneArtikel}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Fertigmateriallager</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {gesamtBestandFertigmaterial}
          </CardTitle>
          {/*<CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>*/}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {/*<div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <IconTrendingUp className="size-4" />
          </div>*/}
          <div className="text-muted-foreground">Artikel</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Rohmateriallager</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {gesamtBestandRohmaterial}
          </CardTitle>
          {/*<CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +4.5%
            </Badge>
          </CardAction>*/}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {/* <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <IconTrendingUp className="size-4" />
          </div>*/}
          <div className="text-muted-foreground">Artikel</div>
        </CardFooter>
      </Card>
    </div>
  );
}
