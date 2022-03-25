
import WidgetKit
import SwiftUI
import Intents

struct WidgetData: Decodable {
   var text: String
}

struct Provider: IntentTimelineProvider {
  func placeholder(in context: Context) -> SimpleEntry {
      SimpleEntry(date: Date(), configuration: ConfigurationIntent(), text: "Placeholder")
  }

  func getSnapshot(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (SimpleEntry) -> ()) {
      let entry = SimpleEntry(date: Date(), configuration: configuration, text: "Data goes here")
      completion(entry)
  }

  func getTimeline(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> Void) {
      let userDefaults = UserDefaults.init(suiteName: "group.com.notetes.notetesWidget")
      if userDefaults != nil {
        let entryDate = Date()
        if let savedData = userDefaults!.value(forKey: "widgetKey") as? String {
            let decoder = JSONDecoder()
            let data = savedData.data(using: .utf8)
            if let parsedData = try? decoder.decode(WidgetData.self, from: data!) {
                let nextRefresh = Calendar.current.date(byAdding: .minute, value: 5, to: entryDate)!
                let entry = SimpleEntry(date: nextRefresh, configuration: configuration, text: parsedData.text)
                let timeline = Timeline(entries: [entry], policy: .atEnd)
                completion(timeline)
            } else {
                print("Could not parse data")
            }
        } else {
            let nextRefresh = Calendar.current.date(byAdding: .minute, value: 5, to: entryDate)!
            let entry = SimpleEntry(date: nextRefresh, configuration: configuration, text: "No data set")
            let timeline = Timeline(entries: [entry], policy: .atEnd)
            completion(timeline)
        }
      }
  }

  struct SimpleEntry: TimelineEntry {
      let date: Date
      let configuration: ConfigurationIntent
      let text: String
  }

  struct MyWidgetEntryView : View {
    var entry: Provider.Entry
      
    var body: some View {
          VStack {
            Text(entry.text)
              .bold()
              .foregroundColor(.black)
          }.padding(20)
    }
  }

  @main
  struct MyWidget: Widget {
      let kind: String = "MyWidget"

      var body: some WidgetConfiguration {
          IntentConfiguration(kind: kind, intent: ConfigurationIntent.self, provider: Provider()) { entry in
              MyWidgetEntryView(entry: entry)
          }
          .configurationDisplayName("My Widget")
          .description("This is an example widget.")
      }
  }

  struct MyWidget_Previews: PreviewProvider {
      static var previews: some View {
          MyWidgetEntryView(entry: SimpleEntry(date: Date(), configuration: ConfigurationIntent(), text: "Widget preview"))
              .previewContext(WidgetPreviewContext(family: .systemSmall))
      }
  }
}
