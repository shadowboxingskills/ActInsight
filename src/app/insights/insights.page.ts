/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/member-ordering */

import { Component, OnInit } from '@angular/core';
import { formatNumber } from '@angular/common';

import { ActionSheetController } from '@ionic/angular';
import { EChartsOption } from 'echarts';

import { DataService } from '../services/data.service';
import { environment } from '../../environments/environment';
import '../shared/theme/dark.js';

@Component({
  selector: 'app-insights',
  templateUrl: './insights.page.html',
  styleUrls: ['./insights.page.scss'],
})
export class InsightsPage implements OnInit {
  // state management
  isSidePanelActive = false;
  isSearching = false;

  // search
  debounceDurationMs = 500;
  query = '';
  hits = [];
  private pickedSample: string;
  private nbInitiativeFound = 0;
  private nbCompanyFound = 0;
  private nbInvestorFound = 0;
  private nbOrgFound = 0;
  private nbRegionFound = 0;
  private nbCountryFound = 0;
  private nbCityFound = 0;
  statsMsg = '';

  // graph chart
  graphChartOptions: EChartsOption = {};
  private maxNbInitiativeParticipants = 10619; // TODO: dynamically calculate it instead
  private maxCountryPop = 1402112000; // TODO: dynamically calculate it instead
  private maxCityPop = 26317000; // TODO: dynamically calculate it instead
  private maxRegionPop = 237882725; // TODO: dynamically calculate it instead
  private MIN_SYMBOL_SIZE = 11.0;
  private MAX_SYMBOL_SIZE = 30.0;
  private SYMBOL_SIZE_VALUE_CAP = 800.0;
  private SYMBOL_SIZE_COUNTRY_POP_VALUE_CAP = 1402112000 / 4;
  private SYMBOL_SIZE_CITY_POP_VALUE_CAP = 26317000 * 0.8;
  private SYMBOL_SIZE_REGION_POP_VALUE_CAP = 237882725 / 3;
  private NODE_LABEL_SYMBOL_SIZE_CUTOFF = 14.0;
  private DEFAULT_PROJECT_SYMBOL_SIZE = 12.0;
  private IS_LARGE_GRAPH_THR = 1800; // # nodes threshold
  private GRAPH_COMPLEXITY_L2_THR = 1200;
  private GRAPH_COMPLEXITY_L3_THR = 1800;

  // side deck
  sideDeck = [];
  MAX_NB_CARDS_DISPLAY = 10;
  isCardFocusActive = false;

  constructor(
    private actionSheetCtrl: ActionSheetController,
    public ds: DataService
  ) {}

  ngOnInit() {
    // bind graph updates to data stream events
    this.ds.gotDataSubject.subscribe(() => {
      this.hits = [...this.ds.initiatives];
      this.updateGraph();
    });
  }

  onRefreshPage() {
    this.ds.gotDataSubject.next(true);
    setTimeout(() => {
      if (this.query !== '') {
        this.query = '';
      }
    }, 1500);
  }

  toggleSidePanel() {
    if (!this.ds.smallScreenFlag) {
      this.isSidePanelActive = this.isSidePanelActive ? false : true;
    } else {
      this.isSidePanelActive = false;
    }

    if (this.isSidePanelActive && this.hits) {
      this.updateGraph();
    }
  }

  onCardFocus(cardName = '') {
    this.isCardFocusActive = true;
    this.query = cardName;
  }

  computeMainGraph(complexityLvl = 1) {
    let dynCat = [];
    switch (complexityLvl) {
      case 1:
        dynCat = [
          { name: 'Initiative' },
          { name: 'Company' },
          { name: 'Country' },
        ];
        break;
      case 2:
        dynCat = [
          { name: 'Initiative' },
          { name: 'Company' },
          { name: 'Country' },
          { name: 'City' },
        ];
        break;
      case 3:
        dynCat = [
          { name: 'Initiative' },
          { name: 'Company' },
          { name: 'Country' },
          { name: 'City' },
          { name: 'Investor' },
          { name: 'Organization' },
          { name: 'Region' },
        ];
        break;
      default: // L1
        dynCat = [
          { name: 'Initiative' },
          { name: 'Company' },
          { name: 'Country' },
        ];
        break;
    }
    const mainGraph = {
      nodes: [],
      links: [],
      categories: dynCat,
    };

    this.sideDeck = [];
    const initiativeIds: string[] = [];
    const countryIds: string[] = [];
    const companyIds: string[] = [];
    const investorIds: string[] = [];
    const orgIds: string[] = [];
    const regionIds: string[] = [];
    const cityIds: string[] = [];

    this.nbInitiativeFound = 0;
    this.nbCompanyFound = 0;
    this.nbInvestorFound = 0;
    this.nbOrgFound = 0;
    this.nbRegionFound = 0;
    this.nbCountryFound = 0;
    this.nbCityFound = 0;

    this.hits.forEach((initiative: any, idx: number) => {
      // initiative
      mainGraph.nodes.push({
        id: initiative.a,
        name: initiative.a || '',
        // normalize size based on # participants
        symbolSize: initiative.k
          ? Math.max(
              (Math.min(initiative.k, this.SYMBOL_SIZE_VALUE_CAP) /
                Math.min(
                  this.maxNbInitiativeParticipants,
                  this.SYMBOL_SIZE_VALUE_CAP
                )) *
                this.MAX_SYMBOL_SIZE,
              this.MIN_SYMBOL_SIZE
            )
          : this.DEFAULT_PROJECT_SYMBOL_SIZE,
        category: 0,
        launchYr: initiative.c || 0,
        initiativeFn: initiative.d.join(', ') || '',
        thematicArea: initiative.e.join(', ') || '',
        sdg: initiative.f.join(', ') || '',
        website: initiative.g || '',
        leadOrg: initiative.h.join(', ') || '',
        address: initiative.i.join(', ') || '',
        email: initiative.j || '',
        nbParticipants: initiative.k || 0,
        companies: initiative.l.slice(0, 5).join(', ') || '',
        investors: initiative.m.slice(0, 5).join(', ') || '',
        organizations: initiative.n.slice(0, 5).join(', ') || '',
        regions: initiative.o.slice(0, 8).join(', ') || '',
        cities: initiative.p.slice(0, 8).join(', ') || '',
        countries: initiative.q.slice(0, 8).join(', ') || '',
        climateFocus: initiative.r.join(', ') || '',
        description: initiative.s || '',
        unfcccUrl: `${this.ds.unfcccBaseUrl}${initiative.b.toString()}` || '',
      });

      if (this.isSidePanelActive) {
        const countries = [];
        initiative.q.forEach((cn: string) => {
          const code: string = this.ds.getCountryCode(cn);
          if (code) {
            countries.push({
              cn,
              cc: code,
            });
          }
        });
        this.sideDeck.push({
          name: initiative.a || '',
          categoryName: 'Initiative',
          launchYr: initiative.c || 0,
          initiativeFn: initiative.d || '',
          thematicArea: initiative.e || '',
          sdg: initiative.f || [],
          website: initiative.g || '',
          leadOrg: initiative.h.join(', ') || '',
          address: initiative.i.join(', ') || '',
          email: initiative.j || '',
          nbParticipants: initiative.k || 0,
          countries,
          climateFocus: initiative.r.join(', ') || '',
          description: initiative.s || '',
          unfcccUrl: `${this.ds.unfcccBaseUrl}${initiative.b.toString()}` || '',
        });
      }

      // pull all initiative names so far
      initiativeIds.push(initiative.a);

      // add company edges
      initiative.l.forEach((company: string) => {
        mainGraph.links.push({
          source: initiative.a,
          target: company,
        });
        companyIds.push(company);
      });

      // add country edges
      initiative.q.forEach((country: string) => {
        mainGraph.links.push({
          source: initiative.a,
          target: country,
        });
        countryIds.push(country);
      });

      // add cities edges
      initiative.p.forEach((city: string) => {
        if (complexityLvl >= 2) {
          mainGraph.links.push({
            source: initiative.a,
            target: city,
          });
        }
        cityIds.push(city);
      });

      // add investors edges
      initiative.m.forEach((investor: string) => {
        if (complexityLvl >= 3) {
          mainGraph.links.push({
            source: initiative.a,
            target: investor,
          });
        }
        investorIds.push(investor);
      });

      // add organizations edges
      initiative.n.forEach((org: string) => {
        if (complexityLvl >= 3) {
          mainGraph.links.push({
            source: initiative.a,
            target: org,
          });
        }
        orgIds.push(org);
      });

      // add regions edges
      initiative.o.forEach((region: string) => {
        if (complexityLvl >= 3) {
          mainGraph.links.push({
            source: initiative.a,
            target: region,
          });
        }
        regionIds.push(region);
      });
    });
    this.nbInitiativeFound = this.hits.length || 0;

    // company nodes
    this.ds.nzTracker
      .filter((t) => t.b === 'co')
      .forEach((company: any) => {
        if (companyIds.includes(company.a)) {
          mainGraph.nodes.push({
            id: company.a || '',
            name: company.a || '',
            category: 1,
            endTarget: company.c || '',
            endTargetPcReduction: company.d || 0,
            endTargetYr: company.e || 0,
            endTargetStatus: company.f || '',
            endTargetText: company.g || '',
          });
          this.nbCompanyFound++;
        }
      });

    // country nodes
    this.ds.nzTracker
      .filter((t) => t.b === 'c')
      .forEach((country: any) => {
        if (countryIds.includes(country.a)) {
          mainGraph.nodes.push({
            id: country.a || '',
            name: country.a || '',
            category: 2,
            // normalize size based on population size
            symbolSize: country.h
              ? Math.max(
                  (Math.min(country.h, this.SYMBOL_SIZE_COUNTRY_POP_VALUE_CAP) /
                    Math.min(
                      this.maxCountryPop,
                      this.SYMBOL_SIZE_COUNTRY_POP_VALUE_CAP
                    )) *
                    this.MAX_SYMBOL_SIZE,
                  this.MIN_SYMBOL_SIZE
                )
              : this.DEFAULT_PROJECT_SYMBOL_SIZE,
            endTarget: country.c || '',
            endTargetPcReduction: country.d || 0,
            endTargetYr: country.e || 0,
            endTargetStatus: country.f || '',
            endTargetText: country.g || '',
            population: country.h || 0,
          });
          this.nbCountryFound++;
        }
      });

    // city nodes
    this.ds.nzTracker
      .filter((t) => t.b === 'ct')
      .forEach((city: any) => {
        if (cityIds.includes(city.a)) {
          if (complexityLvl >= 2) {
            mainGraph.nodes.push({
              id: city.a || '',
              name: city.a || '',
              category: 3,
              // normalize size based on population size
              symbolSize: city.h
                ? Math.max(
                    (Math.min(city.h, this.SYMBOL_SIZE_CITY_POP_VALUE_CAP) /
                      Math.min(
                        this.maxCityPop,
                        this.SYMBOL_SIZE_CITY_POP_VALUE_CAP
                      )) *
                      this.MAX_SYMBOL_SIZE,
                    this.MIN_SYMBOL_SIZE
                  )
                : this.DEFAULT_PROJECT_SYMBOL_SIZE,
              endTarget: city.c || '',
              endTargetPcReduction: city.d || 0,
              endTargetYr: city.e || 0,
              endTargetStatus: city.f || '',
              endTargetText: city.g || '',
              population: city.h || 0,
              latitude: city.i || 0,
              longitude: city.j || 0,
              mayorFullName: city.k || '',
              emissionsTotal: city.l || 0,
            });
          }
          this.nbCityFound++;
        }
      });

    // investor
    this.ds.nzTracker
      .filter((t) => t.b === 'i')
      .forEach((investor: any) => {
        if (investorIds.includes(investor.a)) {
          if (complexityLvl >= 3) {
            mainGraph.nodes.push({
              id: investor.a || '',
              name: investor.a || '',
              category: 4,
              endTarget: investor.c || '',
              endTargetPcReduction: investor.d || 0,
              endTargetYr: investor.e || 0,
              endTargetStatus: investor.f || '',
              endTargetText: investor.g || '',
            });
          }
          this.nbInvestorFound++;
        }
      });

    // organization
    this.ds.organizations.forEach((org: any) => {
      if (orgIds.includes(org.a) && !initiativeIds.includes(org.a)) {
        if (complexityLvl >= 3) {
          mainGraph.nodes.push({
            id: org.a || '',
            name: org.a || '',
            category: 5,
            endTarget: org.c || '',
            endTargetPcReduction: org.d || 0,
            endTargetYr: org.v || 0,
            endTargetStatus: org.f || '',
            endTargetText: org.g || '',
          });
        }
        this.nbOrgFound++;
      }
    });

    // region
    this.ds.nzTracker
      .filter((t) => t.b === 'r')
      .forEach((region: any) => {
        if (regionIds.includes(region.a)) {
          if (complexityLvl >= 3) {
            mainGraph.nodes.push({
              id: region.a || '',
              name: region.a || '',
              category: 6,
              // normalize size based on population size
              symbolSize: region.h
                ? Math.max(
                    (Math.min(region.h, this.SYMBOL_SIZE_REGION_POP_VALUE_CAP) /
                      Math.min(
                        this.maxRegionPop,
                        this.SYMBOL_SIZE_REGION_POP_VALUE_CAP
                      )) *
                      this.MAX_SYMBOL_SIZE,
                    this.MIN_SYMBOL_SIZE
                  )
                : this.DEFAULT_PROJECT_SYMBOL_SIZE,
              endTarget: region.c || '',
              endTargetPcReduction: region.d || 0,
              endTargetYr: region.e || 0,
              endTargetStatus: region.f || '',
              endTargetText: region.g || '',
              population: region.h || 0,
            });
          }
          this.nbRegionFound++;
        }
      });

    if (!environment.production) {
      console.log(`*** graph @ L${complexityLvl} ***`, mainGraph);
    }
    return mainGraph;
  }

  updateGraph() {
    let graph = this.computeMainGraph(3);
    let nbNodes = graph.nodes.length;

    if (nbNodes > this.GRAPH_COMPLEXITY_L3_THR) {
      graph = this.computeMainGraph(2);
      nbNodes = graph.nodes.length;

      if (nbNodes > this.GRAPH_COMPLEXITY_L2_THR) {
        graph = this.computeMainGraph(1);
        nbNodes = graph.nodes.length;
      }
    }

    graph.nodes.forEach((node: any) => {
      node.label = {
        show: node.symbolSize > this.NODE_LABEL_SYMBOL_SIZE_CUTOFF,
      };
    });

    this.isCardFocusActive = this.nbInitiativeFound === 1;
    this.updateStats();

    // chart options
    const isLargeGraph = nbNodes > this.IS_LARGE_GRAPH_THR;
    this.graphChartOptions = {
      title: {
        text: 'Action Tracker',
        show: false,
        // position: "top",
        left: 'center',
      },
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          magicType: {
            show: false,
            type: ['line', 'bar'],
            title: {
              line: 'Line',
              bar: 'Bar',
            },
          },
          dataView: {
            show: false,
            title: 'Action Tracker',
            readOnly: true,
          },
          restore: { show: true, title: 'Reset' },
          saveAsImage: {
            show: true,
            title: 'Save',
            name: 'Action_Tracker',
          },
        },
      },
      color: [
        '#5470c6',
        '#91cc75',
        '#fac858',
        '#ee6666',
        '#73c0de',
        '#3ba272',
        '#fc8452',
        '#9a60b4',
        '#ea7ccc',
      ],
      legend: [
        {
          // selectedMode: 'single',
          data: graph.categories.map((a) => a.name),
          show: true,
          orient: 'horizontal',
          align: 'auto',
          selectorPosition: 'auto',
        },
      ],
      series: [
        {
          name: 'ActionTracking',
          type: 'graph',
          layout: isLargeGraph ? 'circular' : 'force',
          data: graph.nodes,
          links: graph.links,
          categories: graph.categories,
          roam: true,
          label: {
            position: 'right',
            formatter: '{b}',
          },
          lineStyle: {
            color: 'target',
            curveness: 0.3,
            width: 0.5,
          },
          emphasis: {
            focus: 'adjacency',
            scale: true,
            lineStyle: {
              width: 8,
            },
          },
          // force: {
          //   repulsion: 250,
          //   gravity: 0.06,
          //   layoutAnimation: true,
          //   friction: 0.5,
          // },
          draggable: isLargeGraph ? false : true,
        },
      ],
      gradientColor: ['#f6efa6', '#d88273', '#bf444c'],
      animation: isLargeGraph ? false : true,
      // stateAnimation: {
      //   duration: 600,
      //   easing: 'cubicOut',
      // },
      // animationDuration: 1500,
      // animationEasingUpdate: 'quinticInOut',
      // animationDurationUpdate: 500,
      // animationEasing: 'cubicInOut',
      // animationThreshold: 2000,
      // progressiveThreshold: 2000,
      // progressive: 400,
      // hoverLayerThreshold: 4000,
      tooltip: {
        show: true,
        trigger: 'item',
        renderMode: 'html',
        confine: true,
        formatter: (params: any) => {
          let htmlString = '';
          if (params.dataType === 'node') {
            switch (params.data.category) {
              case 0:
                htmlString = this.buildInitiativeAnnotations(params);
                break;

              case 1:
              case 4:
              case 5:
                htmlString = this.buildCompanyAnnotations(params);
                break;

              case 3:
                htmlString = this.buildCityAnnotation(params);
                break;

              case 2:
              case 6:
                htmlString = this.buildCountryAnnotation(params);
                break;

              default:
                break;
            }
            return htmlString;
          } else if (params.dataType === 'edge') {
            return params.data.label;
          } else {
            return 'error: type is undefined';
          }
        },
      },
    };
  }

  async showQueryExamples() {
    const buttonItems = [];
    this.ds.sampleQueries.forEach((el) => {
      buttonItems.push({
        text: el,
        data: {
          sample: el,
        },
      });
    });

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Try a sample query',
      buttons: [
        ...buttonItems,
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });
    await actionSheet.present();
    const result = await actionSheet.onDidDismiss();
    if (result.role !== 'cancel' && result.data && result.data.sample) {
      this.pickedSample = result.data.sample;
      if (!environment.production) {
        console.log(this.pickedSample);
      }
      this.query = this.pickedSample;
    }
  }

  handleQuery(event) {
    const inputQuery = event.target.value.toLowerCase();
    const filteredQuery: string = this.ds.queryWithoutStopWords(inputQuery);
    if (
      filteredQuery.trim() !== '' &&
      filteredQuery.trim().length >= environment.minQueryLength
    ) {
      this.hits = this.ds.searchInitiatives(inputQuery, filteredQuery);
      this.updateGraph();
    }
  }

  private updateStats() {
    let statsText = '';
    if (
      this.nbInitiativeFound === 0 &&
      this.nbCompanyFound === 0 &&
      this.nbInvestorFound === 0 &&
      this.nbOrgFound === 0 &&
      this.nbRegionFound === 0 &&
      this.nbCountryFound === 0 &&
      this.nbCityFound === 0
    ) {
      statsText = '';
    } else {
      statsText = ` ✨ ${
        this.nbInitiativeFound
          ? this.nbInitiativeFound.toLocaleString() +
            (this.nbInitiativeFound === 1 ? ' initiative' : ' initiatives')
          : ''
      }${this.nbInitiativeFound ? ', ' : ''}${
        this.nbCompanyFound
          ? this.nbCompanyFound.toLocaleString() +
            (this.nbCompanyFound === 1 ? ' company' : ' companies')
          : ''
      }${this.nbCompanyFound ? ', ' : ''}${
        this.nbInvestorFound
          ? this.nbInvestorFound.toLocaleString() +
            (this.nbInvestorFound === 1 ? ' investor' : ' investors')
          : ''
      }${this.nbInvestorFound ? ', ' : ''}${
        this.nbOrgFound
          ? this.nbOrgFound.toLocaleString() +
            (this.nbOrgFound === 1 ? ' org' : ' orgs')
          : ''
      }${this.nbOrgFound ? ', ' : ''}${
        this.nbCountryFound
          ? this.nbCountryFound.toLocaleString() +
            (this.nbCountryFound === 1 ? ' country' : ' countries')
          : ''
      }${this.nbCountryFound ? ', ' : ''}${
        this.nbCityFound
          ? this.nbCityFound.toLocaleString() +
            (this.nbCityFound === 1 ? ' city' : ' cities')
          : ''
      }${this.nbCityFound ? ', ' : ''}${
        this.nbRegionFound
          ? this.nbRegionFound.toLocaleString() +
            (this.nbRegionFound === 1 ? ' region' : ' regions')
          : ''
      }`;
    }
    this.statsMsg = statsText;
  }

  onChartClick(e: any) {
    if (e && e.data && e.data.name) {
      this.query = e.data.name;
    }
  }

  private buildInitiativeAnnotations(params) {
    return `<div style="max-width: ${
      this.ds.smallScreenFlag ? 60 : this.isSidePanelActive ? 30 : 35
    }vw; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; text-align: left;">
      <b>${params.name}</b><br />
      Launched in <b><span style="color: #4CAF50">${
        params.data.launchYr
      }</span></b><br />
      # participants: <b><span style="color: #4CAF50">${
        params.data.nbParticipants
      }</span></b><br />
      SDG: <b><span style="color: #4CAF50">${params.data.sdg}</span></b><br />
      Functions: <b><span style="color: #4CAF50">${
        params.data.initiativeFn
      }</span></b><br />
      Area: <b><span style="color: #4CAF50">${
        params.data.thematicArea
      }</span></b><br />
      Lead: <b><span style="color: #4CAF50">${
        params.data.leadOrg
      }</span></b><br />
      HQ: <b><span style="color: #4CAF50">${
        params.data.address
      }</span></b><br />
      Companies: <b><span style="color: #4CAF50">${
        params.data.companies
      }</span></b><br />
      Investors: <b><span style="color: #4CAF50">${
        params.data.investors
      }</span></b><br />
      Organizations: <b><span style="color: #4CAF50">${
        params.data.organizations
      }</span></b><br />
      Regions: <b><span style="color: #4CAF50">${
        params.data.regions
      }</span></b><br />
      Cities: <b><span style="color: #4CAF50">${
        params.data.cities
      }</span></b><br />
      Countries: <b><span style="color: #4CAF50">${
        params.data.countries
      }</span></b><br />
      Climate focus: <b><span style="color: #4CAF50">${
        params.data.climateFocus
      }</span></b><br />
      Description: <b><span style="color: #4CAF50">${
        params.data.description
      }</span></b>
    </div>`;
  }

  private buildCompanyAnnotations(params) {
    return `<div style="max-width: ${
      this.ds.smallScreenFlag ? 60 : this.isSidePanelActive ? 30 : 35
    }vw; text-align: left;">
      <b>${params.name}</b><br />
      End target: <b><span style="color: #4CAF50">${
        params.data.endTarget
      }</span></b><br />
      End target reduction: <b><span style="color: #4CAF50">${
        params.data.endTargetPcReduction === 0
          ? ''
          : params.data.endTargetPcReduction + '%'
      }</span></b><br />
      End target year: <b><span style="color: #4CAF50">${
        params.data.endTargetYr === 0 ? '' : params.data.endTargetYr
      }</span></b><br />
      End target status: <b><span style="color: #4CAF50">${
        params.data.endTargetStatus
      }</span></b><br />
      Summary: <b><span style="color: #4CAF50; white-space:pre-wrap; text-align: left; overflow-wrap: break-word; word-wrap: break-word; hyphens: auto;">${
        params.data.endTargetText
      }</span></b>
    </div>`;
  }

  private buildCountryAnnotation(params) {
    return `<div style="max-width: ${
      this.ds.smallScreenFlag ? 60 : this.isSidePanelActive ? 30 : 35
    }vw; text-align: left;">
      <b>${params.name}</b><br />
      Population: <b><span style="color: #4CAF50">${
        params.data.population === 0
          ? ''
          : formatNumber(params.data.population, 'en-US')
      }</span></b><br />
      End target: <b><span style="color: #4CAF50">${
        params.data.endTarget
      }</span></b><br />
      End target reduction: <b><span style="color: #4CAF50">${
        params.data.endTargetPcReduction === 0
          ? ''
          : params.data.endTargetPcReduction + '%'
      }</span></b><br />
      End target year: <b><span style="color: #4CAF50">${
        params.data.endTargetYr === 0 ? '' : params.data.endTargetYr
      }</span></b><br />
      End target status: <b><span style="color: #4CAF50">${
        params.data.endTargetStatus
      }</span></b><br />
      Summary: <b><span style="color: #4CAF50; white-space:pre-wrap; text-align: left; overflow-wrap: break-word; word-wrap: break-word; hyphens: auto;">${
        params.data.endTargetText
      }</span></b>
    </div>`;
  }

  // latitude: city.i || 0,
  // longitude: city.j || 0,
  // mayorFullName: city.k || '',
  // emissionsTotal: city.l || 0,

  private buildCityAnnotation(params) {
    return `<div style="max-width: ${
      this.ds.smallScreenFlag ? 60 : this.isSidePanelActive ? 30 : 35
    }vw; text-align: left;">
      <b>${params.name}</b><br />
      Population: <b><span style="color: #4CAF50">${
        params.data.population === 0
          ? ''
          : formatNumber(params.data.population, 'en-US')
      }</span></b><br />
      End target: <b><span style="color: #4CAF50">${
        params.data.endTarget
      }</span></b><br />
      End target reduction: <b><span style="color: #4CAF50">${
        params.data.endTargetPcReduction === 0
          ? ''
          : params.data.endTargetPcReduction + '%'
      }</span></b><br />
      End target year: <b><span style="color: #4CAF50">${
        params.data.endTargetYr === 0 ? '' : params.data.endTargetYr
      }</span></b><br />
      End target status: <b><span style="color: #4CAF50">${
        params.data.endTargetStatus
      }</span></b><br />
      Mayor name: <b><span style="color: #4CAF50">${
        params.data.mayorFullName
      }</span></b><br />
      Total emissions: <b><span style="color: #4CAF50">${
        params.data.emissionsTotal === 0 ? '' : params.data.emissionsTotal
      }</span></b><br />
      Coordinates: <b><span style="color: #4CAF50">${
        params.data.latitude && params.data.longitude
          ? params.data.latitude + ', ' + params.data.longitude
          : ''
      }</span></b><br />
      Summary: <b><span style="color: #4CAF50; white-space:pre-wrap; text-align: left; overflow-wrap: break-word; word-wrap: break-word; hyphens: auto;">${
        params.data.endTargetText
      }</span></b>
    </div>`;
  }
}
