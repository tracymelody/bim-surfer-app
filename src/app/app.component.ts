import { Component } from '@angular/core';
import { BimServerClient } from 'bimserverapi/BimServerClient';
import { BimServerViewer } from 'surfer/target/classes/viewer/bimserverviewer';
import { ProjectInfo } from './project-info.model';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'bim-surfer';
    projectsInfo: ProjectInfo[] = [];
    bimServerClient: BimServerClient;
    bimServerViewer: BimServerViewer;


    onLoginClick() {
        this.login();
    }

    navigateToProject(info: ProjectInfo) {
        this.loadProject(info.poid);
    }

    private login() {
        this.bimServerClient = new BimServerClient('http://localhost:8082');

        this.bimServerClient.init(() => {
            this.bimServerClient.login(
                'slivka@kros.sk',
                '21kros12',
                () => this.loginCallBack(),
                (error: any) => console.log(error));
        });
    }

    private loginCallBack() {
        this.bimServerClient.call('ServiceInterface', 'getAllProjects',
            { onlyTopLevel: true, onlyActive: true },
            (projects: any) => this.getAllProjectsCallBack(projects),
            (error: any) => this.errorCallBack(error)
        );
    }

    private getAllProjectsCallBack(projects: any) {
        projects.forEach((project: any) => this.getProjectInfo(project));
    }

    private getProjectInfo(project: any) {
        if (project.lastRevisionId !== -1) {
            this.projectsInfo.push({ name: project.name, poid: project.oid });
        }
    }

    private errorCallBack(error: any) {
        console.error(error);
    }

    private loadProject(poid: number) {
        this.bimServerClient.call('ServiceInterface', 'getProjectByPoid', {
            poid: poid
        }, (project: any) => {
            // Select what canvas to bind the viewer to, this canvas has to exist (add it to your html or create it dynamically)
            const canvas = document.getElementById('glcanvas');

            // Create a new BimServerViewer
            this.bimServerViewer = new BimServerViewer(
                this.bimServerClient,
                { viewerBasePath: '../' },
                canvas,
                canvas.clientWidth,
                canvas.clientHeight);

            // Load the model
            this.bimServerViewer.loadModel(project);
        });
    }
}