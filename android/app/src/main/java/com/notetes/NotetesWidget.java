package com.notetes;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.PictureDrawable;
import android.widget.RemoteViews;
import android.content.SharedPreferences;

import com.caverock.androidsvg.SVG;
import com.caverock.androidsvg.SVGParseException;

import org.json.JSONException;
import org.json.JSONObject;
/**
 * Implementation of App Widget functionality.
 */
public class NotetesWidget extends AppWidgetProvider {

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {

        try {

            Intent intent = new Intent(context, MainActivity.class);
            PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, 0);

            SharedPreferences sharedPref = context.getSharedPreferences("DATA", Context.MODE_PRIVATE);

            String appString = sharedPref.getString("appData", "{\"svg\":'<svg width=\"100\" height=\"100\"><circle cx=\"50\" cy=\"50\" r=\"40\" stroke=\"green\" stroke-width=\"4\" fill=\"yellow\" /></svg>'}");
            JSONObject appData = new JSONObject(appString);

            SVG svg = SVG.getFromString(appData.getString("svg"));
            PictureDrawable pd = new PictureDrawable(svg.renderToPicture());
            Bitmap bitmap = Bitmap.createBitmap(400, 400, Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(bitmap);
            pd.setBounds(0, 0, bitmap.getWidth(), bitmap.getHeight());
            pd.draw(canvas);
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.notetes_widget);
            views.setOnClickPendingIntent(R.id.imageView3, pendingIntent);
            views.setImageViewBitmap(R.id.imageView3, bitmap);
            appWidgetManager.updateAppWidget(appWidgetId, views);
        }catch (SVGParseException | JSONException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {

        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }



    }

    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
    }

    @Override
    public void onDisabled(Context context) {
        // Enter relevant functionality for when the last widget is disabled
    }
}